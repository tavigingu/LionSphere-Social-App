// frontend/src/store/StoryStore.ts
import { create } from 'zustand';
import { 
    getTimelineStories as fetchTimelineStories,
    createStory as createNewStory,
    viewStory as markStoryAsViewed,
    deleteStory as removeStory,
    likeStory as toggleStoryLike,
    getStoryLikes as fetchStoryLikes
} from '../api/Story';
import { StoryState, IStory, IStoryGroup } from '../types/StoryTypes';

// Define a proper interface for the user who liked a story
interface StoryLiker {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface StoryStore extends StoryState {
    fetchStories: (userId: string) => Promise<void>;
    createStory: (storyData: { userId: string; image: string; caption?: string }) => Promise<IStory>;
    viewStory: (storyId: string, userId: string) => Promise<void>;
    deleteStory: (storyId: string, userId: string) => Promise<void>;
    likeStory: (storyId: string, userId: string) => Promise<void>;
    getStoryLikes: (storyId: string) => Promise<StoryLiker[]>;
    setActiveStoryGroup: (groupIndex: number) => void;
    setActiveStoryIndex: (index: number) => void;
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
            console.log("Fetched story groups:", storyGroups);
            
            // Sort story groups: current user first, then unseen stories, then others
            const sortedGroups = [...storyGroups].sort((a, b) => {
                // Current user is always first
                if (a.userId === userId) return -1;
                if (b.userId === userId) return 1;

                // Then stories with unseen content
                const aHasUnseen = a.stories.some(story => !story.viewers.includes(userId));
                const bHasUnseen = b.stories.some(story => !story.viewers.includes(userId));
                
                if (aHasUnseen && !bHasUnseen) return -1;
                if (!aHasUnseen && bHasUnseen) return 1;

                // Finally by created date (newest first)
                const aLatestDate = Math.max(...a.stories.map(s => new Date(s.createdAt).getTime()));
                const bLatestDate = Math.max(...b.stories.map(s => new Date(s.createdAt).getTime()));
                return bLatestDate - aLatestDate;
            });
            
            // Calculate which groups have unseen stories
            const updatedGroups = sortedGroups.map(group => {
                const hasUnseenStories = group.stories.some(story => 
                    !story.viewers.includes(userId)
                );
                // Sort stories by date, newest first
                const sortedStories = [...group.stories].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                return { 
                    ...group, 
                    hasUnseenStories,
                    stories: sortedStories
                };
            });
            
            console.log("Processed story groups:", updatedGroups);
            
            set({ 
                storyGroups: updatedGroups,
                loading: false 
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stories';
            console.error("Error fetching stories:", errorMessage);
            set({ error: errorMessage, loading: false });
        }
    },
    
    createStory: async (storyData) => {
        set({ loading: true, error: null });
        try {
            console.log("Creating story with data:", storyData);
            const newStory = await createNewStory(storyData);
            console.log("Story created successfully:", newStory);
            
            // Update state by adding the new story
            set((state) => {
                const currentGroups = [...state.storyGroups];
                const userGroupIndex = currentGroups.findIndex(g => g.userId === storyData.userId);
                
                if (userGroupIndex !== -1) {
                    // Add story to existing group
                    const updatedGroup = {
                        ...currentGroups[userGroupIndex],
                        stories: [newStory, ...currentGroups[userGroupIndex].stories],
                        hasUnseenStories: true
                    };
                    currentGroups[userGroupIndex] = updatedGroup;
                    
                    // Move user's group to the front if it's not already
                    if (userGroupIndex > 0) {
                        const userGroup = currentGroups.splice(userGroupIndex, 1)[0];
                        currentGroups.unshift(userGroup);
                    }
                } else {
                    // Create a new group for user
                    currentGroups.unshift({
                        userId: storyData.userId,
                        username: 'You', // Should be replaced with real name
                        profilePicture: undefined, // Should be replaced with real picture
                        stories: [newStory],
                        hasUnseenStories: true
                    });
                }
                
                return { storyGroups: currentGroups, loading: false };
            });
            
            return newStory;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create story';
            console.error("Error creating story:", errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },
    
    viewStory: async (storyId: string, userId: string) => {
        try {
            console.log("Marking story as viewed:", storyId, "by user:", userId);
            await markStoryAsViewed(storyId, userId);
            
            // Update local state to reflect the view
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
                    
                    // Recalculate if the group has unseen stories
                    const hasUnseenStories = updatedStories.some(story => 
                        !story.viewers.includes(userId)
                    );
                    
                    return {
                        ...group,
                        stories: updatedStories,
                        hasUnseenStories
                    };
                });
                
                // Update activeStoryGroup if necessary
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
            console.error("Error marking story as viewed:", errorMessage);
            // Don't set error in state to avoid disrupting user experience
        }
    },
    
    likeStory: async (storyId: string, userId: string) => {
        try {
            console.log("Toggling like for story:", storyId, "by user:", userId);
            const { action, story } = await toggleStoryLike(storyId, userId);
            
            // Update local state to reflect the like/unlike
            set((state) => {
                const updatedGroups = state.storyGroups.map(group => {
                    const updatedStories = group.stories.map(s => {
                        if (s._id === storyId) {
                            return {
                                ...s,
                                likes: story.likes // Use the updated likes array from the response
                            };
                        }
                        return s;
                    });
                    
                    return {
                        ...group,
                        stories: updatedStories
                    };
                });
                
                // Update activeStoryGroup if necessary
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
            
            return;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to like/unlike story';
            console.error("Error liking/unliking story:", errorMessage);
            throw error;
        }
    },
    
    getStoryLikes: async (storyId: string) => {
        try {
            console.log("Fetching likes for story:", storyId);
            const likes = await fetchStoryLikes(storyId);
            return likes;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch story likes';
            console.error("Error fetching story likes:", errorMessage);
            throw error;
        }
    },
    
    deleteStory: async (storyId: string, userId: string) => {
        try {
            console.log("Deleting story:", storyId, "by user:", userId);
            await removeStory(storyId, userId);
            
            // Update state by removing the story
            set((state) => {
                const updatedGroups = state.storyGroups.map(group => {
                    // Filter out the deleted story
                    const updatedStories = group.stories.filter(story => story._id !== storyId);
                    
                    // Recalculate if the group has unseen stories
                    const hasUnseenStories = updatedStories.some(story => 
                        !story.viewers.includes(userId)
                    );
                    
                    return {
                        ...group,
                        stories: updatedStories,
                        hasUnseenStories
                    };
                }).filter(group => group.stories.length > 0); // Remove groups without stories
                
                // Check if we need to close the story viewer
                let activeGroup = state.activeStoryGroup;
                let activeIndex = state.activeStoryIndex;
                let shouldClose = false;
                
                if (activeGroup) {
                    const groupIndex = updatedGroups.findIndex(g => g.userId === activeGroup!.userId);
                    if (groupIndex === -1) {
                        // Group was removed completely
                        shouldClose = true;
                    } else {
                        activeGroup = updatedGroups[groupIndex];
                        // Check if active story was deleted
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
            console.error("Error deleting story:", errorMessage);
            set({ error: errorMessage });
        }
    },
    
    setActiveStoryGroup: (groupIndex: number) => {
        const { storyGroups } = get();
        
        console.log("Setting active story group with index:", groupIndex);
        console.log("Available story groups:", storyGroups);
        
        if (groupIndex >= 0 && groupIndex < storyGroups.length) {
            const activeGroup = storyGroups[groupIndex];
            console.log("Selected active group:", activeGroup);
            
            // Start with the first unseen story if possible
            const firstUnseenIndex = activeGroup.stories.findIndex(
                story => !story.viewers.includes(get().storyGroups[0]?.userId || '')
            );
            
            set({ 
                activeStoryGroup: activeGroup,
                activeStoryIndex: firstUnseenIndex !== -1 ? firstUnseenIndex : 0
            });
        } else {
            console.error("Invalid story group index:", groupIndex);
        }
    },
    
    nextStory: () => {
        const { activeStoryGroup, activeStoryIndex, storyGroups } = get();
        
        if (!activeStoryGroup) {
            console.log("No active story group to navigate");
            return;
        }
        
        console.log("Current active story index:", activeStoryIndex);
        console.log("Total stories in group:", activeStoryGroup.stories.length);
        
        if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
            // Next story in same group
            console.log("Moving to next story in same group");
            set({ activeStoryIndex: activeStoryIndex + 1 });
        } else {
            // Next group
            const currentGroupIndex = storyGroups.findIndex(g => g.userId === activeStoryGroup.userId);
            console.log("Current group index:", currentGroupIndex);
            
            if (currentGroupIndex !== -1 && currentGroupIndex < storyGroups.length - 1) {
                console.log("Moving to next group");
                set({ 
                    activeStoryGroup: storyGroups[currentGroupIndex + 1],
                    activeStoryIndex: 0
                });
            } else {
                // Reached end, close viewer
                console.log("Reached the end of all stories, closing viewer");
                set({ activeStoryGroup: null, activeStoryIndex: 0 });
            }
        }
    },
    
    prevStory: () => {
        const { activeStoryGroup, activeStoryIndex, storyGroups } = get();
        
        if (!activeStoryGroup) {
            console.log("No active story group to navigate");
            return;
        }
        
        console.log("Current active story index:", activeStoryIndex);
        
        if (activeStoryIndex > 0) {
            // Previous story in same group
            console.log("Moving to previous story in same group");
            set({ activeStoryIndex: activeStoryIndex - 1 });
        } else {
            // Previous group
            const currentGroupIndex = storyGroups.findIndex(g => g.userId === activeStoryGroup.userId);
            console.log("Current group index:", currentGroupIndex);
            
            if (currentGroupIndex > 0) {
                const prevGroup = storyGroups[currentGroupIndex - 1];
                console.log("Moving to previous group:", prevGroup);
                set({ 
                    activeStoryGroup: prevGroup,
                    activeStoryIndex: prevGroup.stories.length - 1
                });
            } else {
                console.log("Already at first story of first group");
            }
            // If at first story of first group, do nothing
        }
    },
    
    closeStories: () => {
        console.log("Closing story viewer");
        set({ activeStoryGroup: null, activeStoryIndex: 0 });
    },
    
    clearError: () => set({ error: null }),
    
    resetState: () => set(initialState),

    setActiveStoryIndex: (index: number) => {
        const { activeStoryGroup } = get();
        
        if (activeStoryGroup && index >= 0 && index < activeStoryGroup.stories.length) {
            console.log("Setting active story index to:", index);
            set({ activeStoryIndex: index });
        } else {
            console.error("Invalid story index:", index);
        }
    },
}));

export default useStoryStore;