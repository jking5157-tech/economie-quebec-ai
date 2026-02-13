import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '@/lib/storage';

interface UserData {
  userName: string;
  monthlyIncome: number;
  savingsGoal: number;
  housingExpense: number;
  groceriesExpense: number;
  transportExpense: number;
  cellphoneExpense: number;
  servicesExpense: number;
  otherExpense: number;
}

interface UserContextType extends UserData {
  setUserName: (name: string) => Promise<void>;
  setMonthlyIncome: (income: number) => Promise<void>;
  setSavingsGoal: (goal: number) => Promise<void>;
  setHousingExpense: (amount: number) => Promise<void>;
  setGroceriesExpense: (amount: number) => Promise<void>;
  setTransportExpense: (amount: number) => Promise<void>;
  setCellphoneExpense: (amount: number) => Promise<void>;
  setServicesExpense: (amount: number) => Promise<void>;
  setOtherExpense: (amount: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState('');
  const [monthlyIncome, setMonthlyIncomeState] = useState(3500);
  const [savingsGoal, setSavingsGoalState] = useState(0.1);
  const [housingExpense, setHousingExpenseState] = useState(1200);
  const [groceriesExpense, setGroceriesExpenseState] = useState(450);
  const [transportExpense, setTransportExpenseState] = useState(280);
  const [cellphoneExpense, setCellphoneExpenseState] = useState(85);
  const [servicesExpense, setServicesExpenseState] = useState(120);
  const [otherExpense, setOtherExpenseState] = useState(330);

  // Charger les données au démarrage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Charger depuis StorageService
      const prefs = await StorageService.getPreferences();
      if (prefs.userName) setUserNameState(prefs.userName);
      if (prefs.monthlyIncome) setMonthlyIncomeState(prefs.monthlyIncome);
      if (prefs.savingsGoal) setSavingsGoalState(prefs.savingsGoal);

      // Charger les dépenses depuis AsyncStorage
      const housing = await AsyncStorage.getItem('expense_housing');
      const groceries = await AsyncStorage.getItem('expense_groceries');
      const transport = await AsyncStorage.getItem('expense_transport');
      const cellphone = await AsyncStorage.getItem('expense_cellphone');
      const services = await AsyncStorage.getItem('expense_services');
      const other = await AsyncStorage.getItem('expense_other');

      if (housing) setHousingExpenseState(parseInt(housing));
      if (groceries) setGroceriesExpenseState(parseInt(groceries));
      if (transport) setTransportExpenseState(parseInt(transport));
      if (cellphone) setCellphoneExpenseState(parseInt(cellphone));
      if (services) setServicesExpenseState(parseInt(services));
      if (other) setOtherExpenseState(parseInt(other));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    const prefs = await StorageService.getPreferences();
    await StorageService.savePreferences({ ...prefs, userName: name });
  };

  const setMonthlyIncome = async (income: number) => {
    setMonthlyIncomeState(income);
    const prefs = await StorageService.getPreferences();
    await StorageService.savePreferences({ ...prefs, monthlyIncome: income });
  };

  const setSavingsGoal = async (goal: number) => {
    setSavingsGoalState(goal);
    const prefs = await StorageService.getPreferences();
    await StorageService.savePreferences({ ...prefs, savingsGoal: goal });
  };

  const setHousingExpense = async (amount: number) => {
    setHousingExpenseState(amount);
    await AsyncStorage.setItem('expense_housing', amount.toString());
  };

  const setGroceriesExpense = async (amount: number) => {
    setGroceriesExpenseState(amount);
    await AsyncStorage.setItem('expense_groceries', amount.toString());
  };

  const setTransportExpense = async (amount: number) => {
    setTransportExpenseState(amount);
    await AsyncStorage.setItem('expense_transport', amount.toString());
  };

  const setCellphoneExpense = async (amount: number) => {
    setCellphoneExpenseState(amount);
    await AsyncStorage.setItem('expense_cellphone', amount.toString());
  };

  const setServicesExpense = async (amount: number) => {
    setServicesExpenseState(amount);
    await AsyncStorage.setItem('expense_services', amount.toString());
  };

  const setOtherExpense = async (amount: number) => {
    setOtherExpenseState(amount);
    await AsyncStorage.setItem('expense_other', amount.toString());
  };

  const refreshData = async () => {
    await loadAllData();
  };

  const value: UserContextType = {
    userName,
    monthlyIncome,
    savingsGoal,
    housingExpense,
    groceriesExpense,
    transportExpense,
    cellphoneExpense,
    servicesExpense,
    otherExpense,
    setUserName,
    setMonthlyIncome,
    setSavingsGoal,
    setHousingExpense,
    setGroceriesExpense,
    setTransportExpense,
    setCellphoneExpense,
    setServicesExpense,
    setOtherExpense,
    refreshData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
