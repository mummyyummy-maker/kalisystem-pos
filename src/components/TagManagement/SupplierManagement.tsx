import React, { useState } from 'react';
import { Table, Badge, Button, Group, ActionIcon, Modal, TextInput, Switch, ColorInput, MultiSelect } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { Supplier, Category } from '../../types';

interface SupplierManagementProps {
  suppliers: Supplier[];
  categories: Category[];
  onUpdate: (suppliers: Supplier[]) => void;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ suppliers, categories, onUpdate }) => {
  const [opened, setOpened] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    color: '#3498db',
    active: true,
    categories: [] as string[],
  });

  const handleSubmit = () => {
    if (editingSupplier) {
      const updatedSuppliers = suppliers.map(supplier =>
        supplier.id === editingSupplier.id ? { ...supplier, ...formData } : supplier
      );
      onUpdate(updatedSuppliers);
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...formData,
      };
      onUpdate([...suppliers, newSupplier]);
    }
    setOpened(false);
    resetForm();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact || '',
      email: supplier.email || '',
      color: supplier.color,
      active: supplier.active,
      categories: supplier.categories || [],
    });
    setOpened(true);
  };

  const handleDelete = (supplierId: string) => {
    onUpdate(suppliers.filter(supplier => supplier.id !== supplierId));
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact: '',
      email: '',
      color: '#3498db',
      active: true,
      categories: [],
    });
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`
  }));

  const rows = suppliers.map((supplier) => (
    <Table.Tr key={supplier.id}>
      <Table.Td style={{ color: '#000' }}>{supplier.name}</Table.Td>
      <Table.Td style={{ color: '#000' }}>{supplier.contact || '-'}</Table.Td>
      <Table.Td style={{ color: '#000' }}>{supplier.email || '-'}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          {supplier.categories?.map(catId => {
            const category = categories.find(c => c.id === catId);
            return category ? (
              <Badge key={catId} size="sm" color={category.color}>
                {category.icon}
              </Badge>
            ) : null;
          })}
        </Group>
      </Table.Td>
      <Table.Td>
        <Switch checked={supplier.active} readOnly size="sm" />
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleEdit(supplier)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(supplier.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Group justify="space-between" mb="md">
        <h3 style={{ color: '#000' }}>Supplier Management</h3>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
          Add Supplier
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ color: '#000' }}>Name</Table.Th>
            <Table.Th style={{ color: '#000' }}>Contact</Table.Th>
            <Table.Th style={{ color: '#000' }}>Email</Table.Th>
            <Table.Th style={{ color: '#000' }}>Categories</Table.Th>
            <Table.Th style={{ color: '#000' }}>Active</Table.Th>
            <Table.Th style={{ color: '#000' }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => { setOpened(false); resetForm(); }} title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}>
        <TextInput
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          mb="md"
        />
        <TextInput
          label="Contact"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          mb="md"
        />
        <TextInput
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          mb="md"
        />
        <MultiSelect
          label="Categories"
          value={formData.categories}
          onChange={(value) => setFormData({ ...formData, categories: value })}
          data={categoryOptions}
          mb="md"
        />
        <ColorInput
          label="Color"
          value={formData.color}
          onChange={(color) => setFormData({ ...formData, color })}
          mb="md"
        />
        <Switch
          label="Active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.currentTarget.checked })}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => { setOpened(false); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingSupplier ? 'Update' : 'Add'}
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default SupplierManagement;