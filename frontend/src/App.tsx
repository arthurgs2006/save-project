import { BrowserRouter } from "react-router-dom";
import AnimatedRoutes from "./router/animatedComponents.tsx";
function App() {
  return (
    <>
      <BrowserRouter >
        <AnimatedRoutes />
      </BrowserRouter>
    </>
  )
}

export default App;

// INICIAR SERVER:
// json-server database/users.json --port 3001