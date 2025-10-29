import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import RecurringTransactionsPage from "@/pages/RecurringTransactionsPage";
import Login from "@/pages/Login";
import AddTransaction from "@/pages/AddTransaction";
import BudgetsPage from "@/pages/BudgetsPage";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/RecurringTransactionsPage">
                <RecurringTransactionsPage/>
            </ComponentPreview>
            <ComponentPreview path="/Login">
                <Login/>
            </ComponentPreview>
            <ComponentPreview path="/AddTransaction">
                <AddTransaction/>
            </ComponentPreview>
            <ComponentPreview path="/BudgetsPage">
                <BudgetsPage/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews