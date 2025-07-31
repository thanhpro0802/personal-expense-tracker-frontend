import {createRoot} from 'react-dom/client'
import './styles/shadcn.css'
import App from './App'
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "@/dev";

const root = createRoot(document.getElementById('root')!)
root.render(<DevSupport ComponentPreviews={ComponentPreviews}
                        useInitialHook={useInitial}
>
    <App/>
</DevSupport>)
