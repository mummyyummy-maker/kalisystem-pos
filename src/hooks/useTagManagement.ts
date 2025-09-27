import { useState } from 'react';
import { TagManagement, User, Team, Supplier, Category, MeasureUnit, Tag } from '../types';
import { defaultUsers, defaultTeams, defaultSuppliers, defaultCategories, defaultMeasureUnits } from '../data/defaultData';

const defaultBrandTags: Tag[] = [
  { id: '1', name: 'Premium', color: '#e74c3c' },
  { id: '2', name: 'Organic', color: '#27ae60' },
  { id: '3', name: 'Local', color: '#3498db' },
  { id: '4', name: 'Imported', color: '#9b59b6' },
];

const defaultMeasureUnitTags: Tag[] = [
  { id: '1', name: 'kg', color: '#3498db' },
  { id: '2', name: 'g', color: '#2ecc71' },
  { id: '3', name: 'L', color: '#e74c3c' },
  { id: '4', name: 'ml', color: '#f39c12' },
  { id: '5', name: 'pcs', color: '#9b59b6' },
  { id: '6', name: 'pack', color: '#1abc9c' },
  { id: '7', name: 'box', color: '#34495e' },
];

export const useTagManagement = () => {
  const [tagData, setTagData] = useState<TagManagement>({
    users: defaultUsers,
    teams: defaultTeams,
    suppliers: defaultSuppliers,
    categories: defaultCategories,
    measureUnits: defaultMeasureUnits,
  });
  
  const [brandTags, setBrandTags] = useState<Tag[]>(defaultBrandTags);
  const [measureUnitTags, setMeasureUnitTags] = useState<Tag[]>(defaultMeasureUnitTags);

  const updateUsers = (users: User[]) => {
    setTagData(prev => ({ ...prev, users }));
  };

  const updateTeams = (teams: Team[]) => {
    setTagData(prev => ({ ...prev, teams }));
  };

  const updateSuppliers = (suppliers: Supplier[]) => {
    setTagData(prev => ({ ...prev, suppliers }));
  };

  const updateCategories = (categories: Category[]) => {
    setTagData(prev => ({ ...prev, categories }));
  };

  const updateMeasureUnits = (measureUnits: MeasureUnit[]) => {
    setTagData(prev => ({ ...prev, measureUnits }));
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    };
    updateUsers([...tagData.users, newUser]);
  };

  const addTeam = (team: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...team,
      id: Date.now().toString(),
    };
    updateTeams([...tagData.teams, newTeam]);
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
    };
    updateSuppliers([...tagData.suppliers, newSupplier]);
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    updateCategories([...tagData.categories, newCategory]);
  };

  const addMeasureUnit = (unit: Omit<MeasureUnit, 'id'>) => {
    const newUnit: MeasureUnit = {
      ...unit,
      id: Date.now().toString(),
    };
    updateMeasureUnits([...tagData.measureUnits, newUnit]);
  };

  const updateBrandTags = (tags: Tag[]) => {
    setBrandTags(tags);
  };

  const updateMeasureUnitTags = (tags: Tag[]) => {
    setMeasureUnitTags(tags);
  };

  return {
    tagData,
    brandTags,
    measureUnitTags,
    updateUsers,
    updateTeams,
    updateSuppliers,
    updateCategories,
    updateMeasureUnits,
    updateBrandTags,
    updateMeasureUnitTags,
    addUser,
    addTeam,
    addSupplier,
    addCategory,
    addMeasureUnit,
  };
};