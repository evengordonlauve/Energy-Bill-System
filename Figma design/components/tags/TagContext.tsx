
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

export type Tag = {
  id: string;
  name: string;
  color: string;
  createdBy: string;
};

type TagContextType = {
  tags: Tag[];
  addTag: (name: string, color: string) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
  getTagsByIds: (ids: string[]) => Tag[];
};

// Predefined tag colors
export const TAG_COLORS = [
  'bg-red-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-indigo-500'
];

// Sample initial tags
const initialTags: Tag[] = [
  { id: 'tag-1', name: 'commercial', color: 'bg-blue-500', createdBy: '1' },
  { id: 'tag-2', name: 'residential', color: 'bg-green-500', createdBy: '1' },
  { id: 'tag-3', name: 'office', color: 'bg-amber-500', createdBy: '1' },
  { id: 'tag-4', name: 'energy', color: 'bg-red-500', createdBy: '1' },
  { id: 'tag-5', name: 'apartments', color: 'bg-purple-500', createdBy: '1' },
  { id: 'tag-6', name: 'ventilation', color: 'bg-cyan-500', createdBy: '1' },
  { id: 'tag-7', name: 'heating', color: 'bg-pink-500', createdBy: '1' }
];

const TagContext = createContext<TagContextType | undefined>(undefined);

export function TagProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>(initialTags);

  // Save to localStorage whenever tags change
  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTags = localStorage.getItem('tags');
    if (savedTags) {
      try {
        const parsedTags: Tag[] = JSON.parse(savedTags);
        setTags(parsedTags);
      } catch (error) {
        console.error('Error parsing saved tags:', error);
      }
    }
  }, []);

  const addTag = (name: string, color: string) => {
    if (!user) return;
    
    // Check if tag with the same name already exists
    const existingTag = tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
    if (existingTag) return;

    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: name.toLowerCase(),
      color,
      createdBy: user.id
    };

    setTags([...tags, newTag]);
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags(tags.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  };

  const deleteTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  const getTagById = (id: string) => {
    return tags.find(tag => tag.id === id);
  };

  const getTagsByIds = (ids: string[]) => {
    return tags.filter(tag => ids.includes(tag.id));
  };

  return (
    <TagContext.Provider
      value={{
        tags,
        addTag,
        updateTag,
        deleteTag,
        getTagById,
        getTagsByIds
      }}
    >
      {children}
    </TagContext.Provider>
  );
}

export const useTags = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
};
