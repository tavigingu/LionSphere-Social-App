// frontend/src/types/StoryTypes.ts
export interface IStory {
    _id: string;
    userId: string;
    image: string;
    caption?: string;
    viewers: string[];
    likes: string[];  // Added likes array
    createdAt: string;
    expiresAt: string;
}

export interface IStoryGroup {
    userId: string;
    username: string;
    profilePicture?: string;
    stories: IStory[];
    hasUnseenStories?: boolean; // Calculat pe frontend
}

export interface StoryState {
    storyGroups: IStoryGroup[];
    activeStoryGroup: IStoryGroup | null;
    activeStoryIndex: number;
    loading: boolean;
    error: string | null;
}