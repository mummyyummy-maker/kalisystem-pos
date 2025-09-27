import React, { useState } from 'react';
import { Group, Button, Badge, ActionIcon, TextInput, Text, Flex } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagsManagementProps {
  tags: Tag[];
  onUpdate: (tags: Tag[]) => void;
  title?: string;
  placeholder?: string;
  tagType?: 'brand' | 'unit';
}

const TagsManagement: React.FC<TagsManagementProps> = ({ 
  tags, 
  onUpdate, 
  title = "Tags",
  placeholder = "Enter tag name and press Enter",
  tagType = 'brand'
}) => {
  const [newTagName, setNewTagName] = useState('');

  // Automatic color assignment based on tag type
  const getColorForTag = (tagName: string, type: 'brand' | 'unit'): string => {
    const brandColors = [
      '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', 
      '#1abc9c', '#34495e', '#e67e22', '#8e44ad', '#27ae60'
    ];
    
    const unitColors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
      '#1abc9c', '#34495e', '#e67e22', '#8e44ad', '#27ae60'
    ];

    const colors = type === 'brand' ? brandColors : unitColors;
    
    // Use string hash to consistently assign colors
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      const char = tagName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    // Check if tag already exists
    if (tags.some(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      return; // Don't add duplicate tags
    }

    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: getColorForTag(newTagName.trim(), tagType),
    };
    
    onUpdate([...tags, newTag]);
    setNewTagName('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleDelete = (tagId: string) => {
    onUpdate(tags.filter(tag => tag.id !== tagId));
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={600} style={{ color: '#000' }}>{title}</Text>
      </Group>

      {/* Tag Creation Input */}
      <Flex gap="xs" mb="lg">
        <TextInput
          placeholder={placeholder}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{ flex: 1 }}
          rightSection={
            newTagName.trim() && (
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={handleAddTag}
              >
                <IconPlus size={16} />
              </ActionIcon>
            )
          }
        />
        <Button 
          onClick={handleAddTag}
          disabled={!newTagName.trim()}
          leftSection={<IconPlus size={16} />}
        >
          Add
        </Button>
      </Flex>

      {/* Tags Display */}
      <Group gap="xs">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            size="lg"
            variant="filled"
            color={tag.color}
            rightSection={
              <ActionIcon
                size="xs"
                color="white"
                variant="transparent"
                onClick={() => handleDelete(tag.id)}
                ml="xs"
              >
                <IconTrash size={12} />
              </ActionIcon>
            }
          >
            {tag.name}
          </Badge>
        ))}
      </Group>

      {tags.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          No {title.toLowerCase()} yet. Type a name above and press Enter to create one.
        </Text>
      )}
    </>
  );
};

export default TagsManagement;