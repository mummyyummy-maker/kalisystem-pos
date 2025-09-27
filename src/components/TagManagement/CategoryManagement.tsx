import React, { useState } from 'react';
import { Table, Badge, Button, Group, ActionIcon, Modal, TextInput, ColorInput, Select, Stack, Text, Divider } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconChevronRight } from '@tabler/icons-react';
import { Category } from '../../types';

interface CategoryManagementProps {
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onUpdate }) => {
  const [opened, setOpened] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3498db',
    icon: '📋',
    level: 'parent' as Category['level'],
    parentId: '',
    order: 1,
  });

  const handleSubmit = () => {
    if (editingCategory) {
      const updatedCategories = categories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, ...formData } : cat
      );
      onUpdate(updatedCategories);
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        order: getNextOrder(formData.level, formData.parentId),
      };
      onUpdate([...categories, newCategory]);
    }
    setOpened(false);
    resetForm();
  };

  const getNextOrder = (level: Category['level'], parentId?: string) => {
    const siblingCategories = categories.filter(cat => 
      cat.level === level && cat.parentId === parentId
    );
    return Math.max(0, ...siblingCategories.map(cat => cat.order)) + 1;
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      level: category.level,
      parentId: category.parentId || '',
      order: category.order,
    });
    setOpened(true);
  };

  const handleDelete = (categoryId: string) => {
    // Check if category has children
    const hasChildren = categories.some(cat => cat.parentId === categoryId);
    if (hasChildren) {
      alert('Cannot delete category with subcategories. Please delete subcategories first.');
      return;
    }
    onUpdate(categories.filter(cat => cat.id !== categoryId));
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      color: '#3498db',
      icon: '📋',
      level: 'parent',
      parentId: '',
      order: 1,
    });
  };

  const getParentOptions = () => {
    switch (formData.level) {
      case 'main':
        return categories.filter(cat => cat.level === 'parent');
      case 'category':
        return categories.filter(cat => cat.level === 'main');
      case 'subcategory':
        return categories.filter(cat => cat.level === 'category');
      default:
        return [];
    }
  };

  const renderCategoryTree = () => {
    const parentCategories = categories.filter(cat => cat.level === 'parent').sort((a, b) => a.order - b.order);
    
    return parentCategories.map(parent => (
      <div key={parent.id} className="mb-6">
        {/* Parent Category */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
          <div className="flex items-center gap-2">
            <Badge size="lg" color={parent.color} variant="filled">
              {parent.icon} {parent.name}
            </Badge>
            <Text size="xs" c="dimmed">Parent</Text>
          </div>
          <Group gap="xs">
            <ActionIcon variant="subtle" onClick={() => handleEdit(parent)}>
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(parent.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </div>

        {/* Main Categories */}
        {categories
          .filter(cat => cat.level === 'main' && cat.parentId === parent.id)
          .sort((a, b) => a.order - b.order)
          .map(main => (
            <div key={main.id} className="ml-4 mb-4">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <IconChevronRight size={16} className="text-gray-400" />
                  <Badge size="md" color={main.color} variant="light">
                    {main.icon} {main.name}
                  </Badge>
                  <Text size="xs" c="dimmed">Main</Text>
                </div>
                <Group gap="xs">
                  <ActionIcon variant="subtle" onClick={() => handleEdit(main)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(main.id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </div>

              {/* Categories */}
              {categories
                .filter(cat => cat.level === 'category' && cat.parentId === main.id)
                .sort((a, b) => a.order - b.order)
                .map(category => (
                  <div key={category.id} className="ml-4 mb-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg mb-1">
                      <div className="flex items-center gap-2">
                        <IconChevronRight size={14} className="text-gray-400" />
                        <Badge size="sm" color={category.color} variant="outline">
                          {category.icon} {category.name}
                        </Badge>
                        <Text size="xs" c="dimmed">Category</Text>
                      </div>
                      <Group gap="xs">
                        <ActionIcon size="sm" variant="subtle" onClick={() => handleEdit(category)}>
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(category.id)}>
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </div>

                    {/* Subcategories */}
                    {categories
                      .filter(cat => cat.level === 'subcategory' && cat.parentId === category.id)
                      .sort((a, b) => a.order - b.order)
                      .map(subcategory => (
                        <div key={subcategory.id} className="ml-4 mb-1">
                          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <IconChevronRight size={12} className="text-gray-400" />
                              <Badge size="xs" color={subcategory.color} variant="dot">
                                {subcategory.icon} {subcategory.name}
                              </Badge>
                              <Text size="xs" c="dimmed">Subcategory</Text>
                            </div>
                            <Group gap="xs">
                              <ActionIcon size="xs" variant="subtle" onClick={() => handleEdit(subcategory)}>
                                <IconEdit size={12} />
                              </ActionIcon>
                              <ActionIcon size="xs" variant="subtle" color="red" onClick={() => handleDelete(subcategory.id)}>
                                <IconTrash size={12} />
                              </ActionIcon>
                            </Group>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))}
      </div>
    ));
  };

  const levelOptions = [
    { value: 'parent', label: 'Parent Category' },
    { value: 'main', label: 'Main Category' },
    { value: 'category', label: 'Category' },
    { value: 'subcategory', label: 'Subcategory' },
  ];

  const parentOptions = getParentOptions().map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`
  }));

  const commonIcons = [
    '📋', '🍳', '📦', '🍕', '🧽', '🍴', '🧻', '👜', '🧀', '🥛',
    '🥩', '🥬', '🍞', '🧄', '🧅', '🥕', '🥔', '🍅', '🌶️', '🫒'
  ];

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={700} style={{ color: '#000' }}>Category Management</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
          Add Category
        </Button>
      </Group>

      <Text size="sm" c="dimmed" mb="lg">
        Organize your categories in a hierarchical structure: Parent → Main → Category → Subcategory
      </Text>

      <div className="space-y-4">
        {renderCategoryTree()}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8">
          <Text c="dimmed">No categories found. Create your first parent category to get started.</Text>
        </div>
      )}

      <Modal 
        opened={opened} 
        onClose={() => { setOpened(false); resetForm(); }} 
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="md"
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Category name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Level"
            placeholder="Select category level"
            value={formData.level}
            onChange={(value) => setFormData({ 
              ...formData, 
              level: value as Category['level'],
              parentId: '' // Reset parent when level changes
            })}
            data={levelOptions}
            required
          />

          {formData.level !== 'parent' && (
            <Select
              label="Parent Category"
              placeholder="Select parent category"
              value={formData.parentId}
              onChange={(value) => setFormData({ ...formData, parentId: value || '' })}
              data={parentOptions}
              required
            />
          )}

          <Group grow>
            <TextInput
              label="Icon"
              placeholder="📋"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
            <ColorInput
              label="Color"
              value={formData.color}
              onChange={(color) => setFormData({ ...formData, color })}
            />
          </Group>

          <div>
            <Text size="sm" mb="xs">Common Icons:</Text>
            <Group gap="xs">
              {commonIcons.map(icon => (
                <Button
                  key={icon}
                  variant="light"
                  size="xs"
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </Button>
              ))}
            </Group>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => { setOpened(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {editingCategory ? 'Update' : 'Add'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default CategoryManagement;