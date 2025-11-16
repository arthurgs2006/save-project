import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import LoadingScreen from '../components/routerComponents/loadingScreen.tsx';

// importações das páginas...
import WelcomePage from '../pages/login/welcome_page.tsx';
import LoginPage from '../pages/login/login.tsx';
import SigninPage from '../pages/login/signIn.tsx';
import Homescreen from '../pages/homescreen/homescreen.tsx';
import Goals from '../pages/goals/goals.tsx';
import Incomes from '../pages/goals/income.tsx';
import Expenses from '../pages/goals/expenses.tsx';
import EditGoals from '../pages/goals/editGoal.tsx';
import Profile from '../pages/user/profile.tsx';
import DetailsID from '../pages/extract_details/$id.tsx';
import Settings from '../pages/settings/settings.tsx';
import NotFound from '../pages/NotFound/NotFound.tsx';
import Deposit from '../pages/manageBalance/deposit.tsx';
import Debts from '../pages/manageBalance/dept.tsx';
import CreateGoal from '../pages/goals/createGoal.tsx';
import RegisterRecurringDebt from '../pages/recurring_expenses/registerRecurringDebt.tsx';
import RecurringDebtsMenu from '../pages/recurring_expenses/menuRecurringDebts.tsx';

export default function AnimatedRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Rotas que devem exibir loading
  const routesWithLoading = [
    "/homescreen",
    "/profile",
    "/goals",
    "/settings",
    "/deposit",
    "/debts"
  ];

  useEffect(() => {
    const shouldLoad = routesWithLoading.includes(location.pathname);

    if (!shouldLoad) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && <LoadingScreen />}

      {!loading && (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signin" element={<SigninPage />} />

            <Route path="/homescreen" element={<Homescreen />} />
            <Route path="/profile" element={<Profile />} />

            {/* Metas */}
            <Route path="/goals" element={<Goals />} />
            <Route path="/goals/create" element={<CreateGoal />} />
            <Route path="/edit-goal/:id" element={<EditGoals />} />

            {/* Entradas / Saídas */}
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/expenses" element={<Expenses />} />

            {/* Outros */}
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/registerDebt/newRecurringDebt" element={<RegisterRecurringDebt />} />
            <Route path="/registerDebt" element={<RecurringDebtsMenu />} />
            <Route path="/transaction/:id" element={<DetailsID />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      )}
    </>
  );
}
