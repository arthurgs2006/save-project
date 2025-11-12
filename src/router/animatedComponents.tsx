import { Route, Routes, useLocation } from 'react-router-dom'
// import HomePage from '../pages/homepage/HomePage'
// import MyProjectsPage from '../pages/myProjects/myProjects'
// import Compentences from '../pages/competences/Compentences'
// import PersonalInfo from '../pages/personalInfo/PersonalInfo'
// import AcademicFormation from '../pages/academicFormation/AcademicFormation'
// import ProfessionalExperiences from '../pages/professionalExperiences/professional_experiences'
// import SelectAccount from '../pages/AccountSelect/AccountSelect'
// import NotFound from '../pages/NotFound/NotFound'
import WelcomePage from '../pages/login/welcome_page.tsx'
import LoginPage from '../pages/login/login.tsx'
import SigninPage from '../pages/login/signIn.tsx'
import Homescreen from '../pages/homescreen/homescreen.tsx'
import Goals from '../pages/goals/goals.tsx'
import Incomes from '../pages/goals/income.tsx'
import Expenses from '../pages/goals/expenses.tsx'
import EditGoals from '../pages/goals/editGoal.tsx'
import Profile from '../pages/user/profile.tsx'
import DetailsID from '../pages/extract_details/$id.tsx'
import Settings from '../pages/settings/settings.tsx'
import NotFound from '../pages/NotFound/NotFound.tsx'
import Deposit from '../pages/manageBalance/deposit.tsx'
import Debts from '../pages/manageBalance/dept.tsx'
import { AnimatePresence } from 'framer-motion'

export default function AnimatedRoutes() {
    const location = useLocation();
    return (
        <>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="" element={<WelcomePage />} />
                    <Route path="/login" element={<LoginPage />} /> 
                    <Route path="/signin" element={<SigninPage />} /> 
                    <Route path="/profile" element={<Profile />} /> 
                    <Route path="/goals" element={<Goals />} /> 
                    <Route path="/editGoal" element={<EditGoals />} /> 
                    <Route path="/incomes" element={<Expenses />} /> 
                    <Route path="/expenses" element={<Incomes />} /> 
                    <Route path="/$id" element={<DetailsID />} /> 
                    <Route path="/settings" element={<Settings />} /> 
                    <Route path="/deposit" element={<Deposit />} /> 
                    <Route path="/debts" element={<Debts />} /> 
                    <Route path="/homescreen" element={<Homescreen />} /> 
                    <Route path="*" element={<NotFound />} /> 
                </Routes>
            </AnimatePresence>
        </>
    )
}