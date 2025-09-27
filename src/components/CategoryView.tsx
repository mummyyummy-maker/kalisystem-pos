import React, { useState, useMemo } from 'react';
import { Paper, Text, Group, ActionIcon, Collapse, Badge, Button, Modal, TextInput, Select, Stack } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconPlus, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface CategoryViewProps {
  items: any[];
  onAddToOrder: (item: any, quantity?: number) => void;
}

interface CategoryHierarchy {
  [parentCategory: string]: {
    [mainCategory: string]: {
      [category: string]: any[];
    };
  };
}

const CategoryView: React.FC<CategoryViewProps> = ({ items, onAddToOrder }) => {
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [expandedMains, setExpandedMains] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showActionsFor, setShowActionsFor] = useState<string>('');
  const [createMainModalOpened, setCreateMainModalOpened] = useState(false);
  const [addCategoryModalOpened, setAddCategoryModalOpened] = useState(false);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedMain, setSelectedMain] = useState('');
  const [newMainName, setNewMainName] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Create category hierarchy from items
  const categoryHierarchy = useMemo(() => {
    const hierarchy: CategoryHierarchy = {};
    
    // Define parent categories based on common patterns
    const parentMapping: { [key: string]: string } = {
      'cleaning': 'Kitchen Supplies',
      'box': 'Packaging',
      'ustensil': 'Kitchen Supplies', 
      'plastic bag': 'Packaging',
      'kitchen roll': 'Kitchen Supplies',
      'cheese': 'Food Items'
    };

    items.forEach(item => {
      if (!item.category) return;
      
      const category = item.category.toLowerCase();
      let parentCategory = 'Other';
      let mainCategory = 'General';
      
      // Determine parent category
      for (const [key, parent] of Object.entries(parentMapping)) {
        if (category.includes(key)) {
          parentCategory = parent;
          break;
        }
      }
      
      // Determine main category based on category content
      if (category.includes('cleaning')) {
        mainCategory = 'Cleaning';
      } else if (category.includes('box')) {
        mainCategory = 'Containers';
      } else if (category.includes('ustensil')) {
        mainCategory = 'Utensils';
      } else if (category.includes('plastic bag')) {
        mainCategory = 'Bags';
      } else if (category.includes('kitchen roll')) {
        mainCategory = 'Paper Products';
      } else if (category.includes('cheese')) {
        mainCategory = 'Dairy';
      }
      
      // Initialize hierarchy structure
      if (!hierarchy[parentCategory]) {
        hierarchy[parentCategory] = {};
      }
      if (!hierarchy[parentCategory][mainCategory]) {
        hierarchy[parentCategory][mainCategory] = {};
      }
      if (!hierarchy[parentCategory][mainCategory][item.category]) {
        hierarchy[parentCategory][mainCategory][item.category] = [];
      }
      
      hierarchy[parentCategory][mainCategory][item.category].push(item);
    });
    
    return hierarchy;
  }, [items]);

  const toggleParent = (parent: string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parent)) {
      newExpanded.delete(parent);
    } else {
      newExpanded.add(parent);
    }
    setExpandedParents(newExpanded);
  };

  const toggleMain = (main: string) => {
    const newExpanded = new Set(expandedMains);
    if (newExpanded.has(main)) {
      newExpanded.delete(main);
    } else {
      newExpanded.add(main);
    }
    setExpandedMains(newExpanded);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateMain = (parent: string) => {
    setSelectedParent(parent);
    setCreateMainModalOpened(true);
  };

  const handleAddCategory = (parent: string, main: string) => {
    setSelectedParent(parent);
    setSelectedMain(main);
    
    // Get all unique categories not already in this main category
    const existingCategories = Object.keys(categoryHierarchy[parent]?.[main] || {});
    const allCategories = new Set<string>();
    
    items.forEach(item => {
      if (item.category && !existingCategories.includes(item.category)) {
        allCategories.add(item.category);
      }
    });
    
    setAvailableCategories(Array.from(allCategories));
    setAddCategoryModalOpened(true);
  };

  const submitCreateMain = () => {
    if (!newMainName.trim()) return;
    
    notifications.show({
      title: 'Main Category Created',
      message: `"${newMainName}" has been added to ${selectedParent}`,
      color: 'green',
    });
    
    setCreateMainModalOpened(false);
    setNewMainName('');
    setSelectedParent('');
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('cleaning')) return 'pink';
    if (categoryLower.includes('box')) return 'orange';
    if (categoryLower.includes('ustensil')) return 'blue';
    if (categoryLower.includes('plastic bag')) return 'cyan';
    if (categoryLower.includes('kitchen roll')) return 'red';
    if (categoryLower.includes('cheese')) return 'yellow';
    return 'gray';
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('cleaning')) return '🧽';
    if (categoryLower.includes('box')) return '📦';
    if (categoryLower.includes('ustensil')) return '🍴';
    if (categoryLower.includes('plastic bag')) return '👜';
    if (categoryLower.includes('kitchen roll')) return '🧻';
    if (categoryLower.includes('cheese')) return '🧀';
    return '📋';
  };

  return (
    <>
      <div style={{ padding: '12px' }}>
        {Object.entries(categoryHierarchy).map(([parentCategory, mainCategories]) => (
          <Paper key={parentCategory} mb="md" p="md" withBorder>
            {/* Parent Category */}
            <Group 
              justify="space-between" 
              mb="sm"
              onClick={() => setShowActionsFor(showActionsFor === `parent-${parentCategory}` ? '' : `parent-${parentCategory}`)}
              style={{ cursor: 'pointer' }}
            >
              <Group 
                onClick={() => toggleParent(parentCategory)}
              >
                <ActionIcon variant="subtle" size="sm">
                  {expandedParents.has(parentCategory) ? 
                    <IconChevronDown size={16} /> : 
                    <IconChevronRight size={16} />
                  }
                </ActionIcon>
                <Text fw={700} size="lg" style={{ color: '#000' }}>
                  📁 {parentCategory}
                </Text>
                <Badge variant="light" color="blue">
                  {Object.keys(mainCategories).length} main categories
                </Badge>
              </Group>
              {showActionsFor === `parent-${parentCategory}` && (
                <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                  <ActionIcon 
                    variant="light" 
                    color="blue"
                    onClick={() => handleCreateMain(parentCategory)}
                    title="Add main category"
                    size="sm"
                  >
                    <IconPlus size={14} />
                  </ActionIcon>
                  <ActionIcon 
                    variant="light" 
                    color="red"
                    title="Delete parent category"
                    size="sm"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              )}
            </Group>

            <Collapse in={expandedParents.has(parentCategory)}>
              {/* Main Categories */}
              {Object.entries(mainCategories).map(([mainCategory, categories]) => (
                <div key={mainCategory} style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <Group justify="space-between" mb="xs">
                    <Group 
                      justify="space-between" 
                      style={{ cursor: 'pointer', width: '100%' }}
                      onClick={() => setShowActionsFor(showActionsFor === `main-${parentCategory}-${mainCategory}` ? '' : `main-${parentCategory}-${mainCategory}`)}
                    >
                      <Group onClick={() => toggleMain(`${parentCategory}-${mainCategory}`)}>
                        <ActionIcon variant="subtle" size="sm">
                          {expandedMains.has(`${parentCategory}-${mainCategory}`) ? 
                            <IconChevronDown size={14} /> : 
                            <IconChevronRight size={14} />
                          }
                        </ActionIcon>
                        <Text fw={600} size="md" style={{ color: '#000' }}>
                          📂 {mainCategory}
                        </Text>
                        <Badge variant="outline" color="orange" size="sm">
                          {Object.keys(categories).length} categories
                        </Badge>
                      </Group>
                      {showActionsFor === `main-${parentCategory}-${mainCategory}` && (
                        <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                          <ActionIcon 
                            variant="light" 
                            color="blue" 
                            size="sm"
                            onClick={() => handleAddCategory(parentCategory, mainCategory)}
                            title="Add category"
                          >
                            <IconPlus size={12} />
                          </ActionIcon>
                          <ActionIcon 
                            variant="light" 
                            color="red" 
                            size="sm"
                            title="Delete main category"
                          >
                            <IconTrash size={12} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Group>
                  </Group>

                  <Collapse in={expandedMains.has(`${parentCategory}-${mainCategory}`)}>
                    {/* Categories */}
                    {Object.entries(categories).map(([categoryName, categoryItems]) => (
                      <div key={categoryName} style={{ marginLeft: '20px', marginBottom: '12px' }}>
                        <Group 
                          justify="space-between" 
                          mb="xs"
                          style={{ cursor: 'pointer', width: '100%' }}
                          onClick={() => setShowActionsFor(showActionsFor === `category-${parentCategory}-${mainCategory}-${categoryName}` ? '' : `category-${parentCategory}-${mainCategory}-${categoryName}`)}
                        >
                          <Group onClick={() => toggleCategory(`${parentCategory}-${mainCategory}-${categoryName}`)}>
                            <ActionIcon variant="subtle" size="xs">
                              {expandedCategories.has(`${parentCategory}-${mainCategory}-${categoryName}`) ? 
                                <IconChevronDown size={12} /> : 
                                <IconChevronRight size={12} />
                              }
                            </ActionIcon>
                            <Badge 
                              variant="filled" 
                              color={getCategoryColor(categoryName)}
                              size="sm"
                            >
                              {getCategoryIcon(categoryName)} {categoryName}
                            </Badge>
                            <Text size="xs" c="dimmed">
                              {categoryItems.length} items
                            </Text>
                          </Group>
                          {showActionsFor === `category-${parentCategory}-${mainCategory}-${categoryName}` && (
                            <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                              <ActionIcon 
                                variant="light" 
                                color="green" 
                                size="xs"
                                title="Add all items to order"
                              >
                                <IconPlus size={10} />
                              </ActionIcon>
                              <ActionIcon 
                                variant="light" 
                                color="red" 
                                size="xs"
                                title="Delete category"
                              >
                                <IconTrash size={10} />
                              </ActionIcon>
                            </Group>
                          )}
                        </Group>

                        <Collapse in={expandedCategories.has(`${parentCategory}-${mainCategory}-${categoryName}`)}>
                          <div style={{ marginLeft: '20px' }}>
                            {categoryItems.map((item, index) => (
                              <Group key={index} justify="space-between" mb="xs" p="xs" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                <Text size="sm" style={{ color: '#000' }}>
                                  {item.Item_name}
                                </Text>
                                <Button 
                                  size="xs" 
                                  variant="light"
                                  onClick={() => onAddToOrder(item)}
                                >
                                  Add to Order
                                </Button>
                              </Group>
                            ))}
                          </div>
                        </Collapse>
                      </div>
                    ))}
                  </Collapse>
                </div>
              ))}
            </Collapse>
          </Paper>
        ))}
      </div>

      {/* Create Main Category Modal */}
      <Modal
        opened={createMainModalOpened}
        onClose={() => setCreateMainModalOpened(false)}
        title={`Add Main Category to ${selectedParent}`}
        centered
      >
        <Stack>
          <TextInput
            label="Main Category Name"
            placeholder="Enter main category name"
            value={newMainName}
            onChange={(e) => setNewMainName(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setCreateMainModalOpened(false)}>
              Cancel
            </Button>
            <Button onClick={submitCreateMain} disabled={!newMainName.trim()}>
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        opened={addCategoryModalOpened}
        onClose={() => setAddCategoryModalOpened(false)}
        title={`Add Category to ${selectedMain}`}
        centered
      >
        <Stack>
          <Select
            label="Select Category"
            placeholder="Choose a category to add"
            data={availableCategories.map(cat => ({ value: cat, label: cat }))}
            searchable
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setAddCategoryModalOpened(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAddCategoryModalOpened(false)}>
              Add Category
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default CategoryView;