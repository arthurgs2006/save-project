import { Route, Routes, useLocation, matchPath } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import CardsBanks from "../pages/cards_banks/CardsBanks";
import Investments from "../pages/investments/Investments";
import Currency from "../pages/currency/Currency";
import LoadingScreen from "../components/routerComponents/loadingScreen.tsx";
import WelcomePage from "../pages/login/welcome_page.tsx";
import LoginPage from "../pages/login/login.tsx";
import SignInPage from "../pages/login/signIn.tsx";
import Homescreen from "../pages/homescreen/homescreen.tsx";
import Goals from "../pages/goals/goals.tsx";
import Incomes from "../pages/goals/income.tsx";
import Expenses from "../pages/goals/expenses.tsx";
import EditGoals from "../pages/goals/editGoal.tsx";
import Profile from "../pages/user/profile.tsx";
import DetailsID from "../pages/extract_details/$id.tsx";
import Settings from "../pages/settings/settings.tsx";
import NotFound from "../pages/NotFound/NotFound.tsx";
import Deposit from "../pages/manageBalance/deposit.tsx";
import Debts from "../pages/manageBalance/dept.tsx";
import CreateGoal from "../pages/goals/createGoal.tsx";
import RegisterRecurringDebt from "../pages/recurring_expenses/registerRecurringDebt.tsx";
import RegisterRecurringCredit from "../pages/recurring_expenses/registerRecurringCredit.tsx";
import RecurringDebtsMenu from "../pages/recurring_expenses/menuRecurringDebts.tsx";
import TransactionHistory from "../pages/homescreen/transactionHistory.tsx";
import Benefits from "../pages/benefits/Benefits.tsx";

export default function AnimatedRoutes() {
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    const routesWithLoading = [
        "/profile",
        "/goals",
        "/settings",
        "/deposit",
        "/debts",
        "/transaction/:id"
    ];

    useEffect(() => {
        const shouldLoad = routesWithLoading.some((route) =>
            matchPath({ path: route, end: true }, location.pathname)
        );

        if (!shouldLoad) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const timer = setTimeout(() => {
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <div style={{ position: "relative" }}>
            {loading && <LoadingScreen />}

            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signin" element={<SignInPage />} />

                    <Route path="/investments" element={<Investments />} />
                    <Route path="/currency" element={<Currency />} />
                    <Route path="/homescreen" element={<Homescreen />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/cards-banks" element={<CardsBanks />} />

                    <Route path="/goals" element={<Goals />} />
                    <Route path="/goals/create" element={<CreateGoal />} />
                    <Route path="/edit-goal/:id" element={<EditGoals />} />
                    <Route path="/benefits" element={<Benefits />} />

                    <Route path="/incomes" element={<Incomes />} />
                    <Route path="/expenses" element={<Expenses />} />

                    <Route path="/deposit" element={<Deposit />} />
                    <Route path="/debts" element={<Debts />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route
                        path="/registerDebt/newRecurringDebt"
                        element={<RegisterRecurringDebt />}
                    />
                    <Route
                        path="/registerCredit/newRecurringCredit"
                        element={<RegisterRecurringCredit />}
                    />
                    <Route path="/registerDebt" element={<RecurringDebtsMenu />} />
                    <Route path="/transaction/:id" element={<DetailsID />} />
                    <Route
                        path="/transaction-history"
                        element={<TransactionHistory />}
                    />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AnimatePresence>
        </div>
    );
}