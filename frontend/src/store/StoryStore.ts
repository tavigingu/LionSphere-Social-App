// frontend/src/store/StoryStore.ts
import { create } from 'zustand';
import { 
    getTimelineStories as fetchTimelineStories,
    createStory as createNewStory,
    viewStory as markStoryAsViewed,
    deleteStory as removeStory
} from '../api/Story';
import { StoryState, IStory } from '../types/StoryTypes';

interface StoryStore extends StoryState {
    fetchStories: (userId: string) => Promise<void>;
    createStory: (storyData: { userId: string; image: string; caption?: string }) => Promise<IStory>;
    viewStory: (storyId: string, userId: string) => Promise<void>;
    deleteStory: (storyId: string, userId: string) => Promise<void>;
    setActiveStoryGroup: (groupIndex: number) => void;
    nextStory: () => void;
    prevStory: () => void;
    closeStories: () => void;
    clearError: () => void;
    resetState: () => void;
}

const initialState: StoryState = {
    storyGroups: [],
    activeStoryGroup: null,
    activeStoryIndex: 0,
    loading: false,
    error: null
};

const useStoryStore = create<StoryStore>((set, get) => ({
    ...initialState,
    
    fetchStories: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const storyGroups = await fetchTimelineStories(userId);
            
            // Calculează care grupuri au stories nevăzute
            const updatedGroups = storyGroups.map(group => {
                const hasUnseenStories = group.stories.some(story => 
                    !story.viewers.includes(userId)
                );
                return { ...group, hasUnseenStories };
            });
            
            set({ 
                storyGroups: updatedGroups,
                loading: false 
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stories';
            set({ error: errorMessage, loading: false });
        }
    },
    
    createStory: async (storyData) => {
        set({ loading: true, error: null });
        try {
            const newStory = await createNewStory(storyData);
            
            // Actualizează state-ul adăugând noul story
            set((state) => {
                const currentGroups = [...state.storyGroups];
                const userGroupIndex = currentGroups.findIndex(g => g.userId === storyData.userId);
                
                if (userGroupIndex !== -1) {
                    // Adaugă story la grupul existent
                    const updatedGroup = {
                        ...currentGroups[userGroupIndex],
                        stories: [newStory, ...currentGroups[userGroupIndex].stories],
                        hasUnseenStories: true
                    };
                    currentGroups[userGroupIndex] = updatedGroup;
                } else {
                    // Crează un nou grup pentru utilizator
                    // În mod normal, ar trebui să obținem datele utilizatorului, dar vom folosi ce avem
                    currentGroups.unshift({
                        userId: storyData.userId,
                        username: 'You', // Ar trebui înlocuit cu numele real
                        profilePicture: undefined, // Ar trebui înlocuit cu poza reală
                        stories: [newStory],
                        hasUnseenStories: true
                    });
                }
                
                return { storyGroups: currentGroups, loading: false };
            });
            
            return newStory;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create story';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },
    
    viewStory: async (storyId: string, userId: string) => {
        try {
            await markStoryAsViewed(storyId, userId);
            
            // Actualizează state-ul local pentru a reflecta vizualizarea
            set((state) => {
                const updatedGroups = state.storyGroups.map(group => {
                    const updatedStories = group.stories.map(story => {
                        if (story._id === storyId && !story.viewers.includes(userId)) {
                            return {
                                ...story,
                                viewers: [...story.viewers, userId]
                            };
                        }
                        return story;
                    });
                    
                    // Recalculează dacă grupul are stories nevăzute
                    const hasUnseenStories = updatedStories.some(story => 
                        !story.viewers.includes(userId)
                    );
                    
                    return {
                        ...group,
                        stories: updatedStories,
                        hasUnseenStories
                    };
                });
                
                // Actualizează activeStoryGroup dacă este necesar
                let activeGroup = state.activeStoryGroup;
                if (activeGroup) {
                    const groupIndex = updatedGroups.findIndex(g => g.userId === activeGroup!.userId);
                    if (groupIndex !== -1) {
                        activeGroup = updatedGroups[groupIndex];
                    }
                }
                
                return { 
                    storyGroups: updatedGroups,
                    activeStoryGroup: activeGroup
                };
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to mark story as viewed';
            console.error(errorMessage);
            // Nu setăm eroarea în state pentru a nu întrerupe experiența utilizatorului
        }
    },
    
    deleteStory: async (storyId: string, userId: string) => {
        try {
            await removeStory(storyId, userId);
            
            // Actualizează state-ul ștergând story-ul
            set((state) => {
                const updatedGroups = state.storyGroups.map(group => {
                    // Exclude story-ul șters
                    const updatedStories = group.stories.filter(story => story._id !== storyId);
                    
                    // Recalculează dacă grupul are stories nevăzute
                    const hasUnseenStories = updatedStories.some(story => 
                        !story.viewers.includes(userId)
                    );
                    
                    return {
                        ...group,
                        stories: updatedStories,
                        hasUnseenStories
                    };
                }).filter(group => group.stories.length > 0); // Elimină grupurile fără stories
                
                // Închide vizualizatorul de stories dacă story-ul activ a fost șters
                let activeGroup = state.activeStoryGroup;
                let activeIndex = state.activeStoryIndex;
                let shouldClose = false;
                
                if (activeGroup) {
                    const groupIndex = updatedGroups.findIndex(g => g.userId === activeGroup!.userId);
                    if (groupIndex === -1) {
                        // Grupul a fost eliminat complet
                        shouldClose = true;
                    } else {
                        activeGroup = updatedGroups[groupIndex];
                        // Verifică dacă story-ul activ a fost șters
                        if (activeIndex >= activeGroup.stories.length) {
                            if (activeGroup.stories.length > 0) {
                                activeIndex = activeGroup.stories.length - 1;
                            } else {
                                shouldClose = true;
                            }
                        }
                    }
                }
                
                return { 
                    storyGroups: updatedGroups,
                    activeStoryGroup: shouldClose ? null : activeGroup,
                    activeStoryIndex: shouldClose ? 0 : activeIndex
                };
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete story';
            set({ error: errorMessage });
        }
    },
    
    setActiveStoryGroup: (groupIndex: number) => {
        const { storyGroups } = get();
        
        if (groupIndex >= 0 && groupIndex < storyGroups.length) {
            set({ 
                activeStoryGroup: storyGroups[groupIndex],
                activeStoryIndex: 0
            });
        }
    },
    
    nextStory: () => {
        const { activeStoryGroup, activeStoryIndex, storyGroups } = get();
        
        if (!activeStoryGroup) return;
        
        if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
            // Următorul story din același grup
            set({ activeStoryIndex: activeStoryIndex + 1 });
        } else {
            // Următorul grup
            const currentGroupIndex = storyGroups.findIndex(g => g.userId === activeStoryGroup.userId);
            if (currentGroupIndex !== -1 && currentGroupIndex < storyGroups.length - 1) {
                set({ 
                    activeStoryGroup: storyGroups[currentGroupIndex + 1],
                    activeStoryIndex: 0
                });
            } else {
                // Am ajuns la final, închidem vizualizatorul
                set({ activeStoryGroup: null, activeStoryIndex: 0 });
            }
        }
    },
    
    prevStory: () => {
        const { activeStoryGroup, activeStoryIndex, storyGroups } = get();
        
        if (!activeStoryGroup) return;
        
        if (activeStoryIndex > 0) {
            // Story-ul anterior din același grup
            set({ activeStoryIndex: activeStoryIndex - 1 });
        } else {
            // Grupul anterior
            const currentGroupIndex = storyGroups.findIndex(g => g.userId === activeStoryGroup.userId);
            if (currentGroupIndex > 0) {
                const prevGroup = storyGroups[currentGroupIndex - 1];
                set({ 
                    activeStoryGroup: prevGroup,
                    activeStoryIndex: prevGroup.stories.length - 1
                });
            }
            // Dacă suntem la primul story din primul grup, nu facem nimic
        }
    },
    
    closeStories: () => {
        set({ activeStoryGroup: null, activeStoryIndex: 0 });
    },
    
    clearError: () => set({ error: null }),
    
    resetState: () => set(initialState)
}));

export default useStoryStore;