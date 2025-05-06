import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import GameContainer from "./containers/GameContainer/GameContainer";
import { GameList } from "./containers/gameList/gameList";
import { Home } from "./containers/home/home";
import BoardProvider from "./context/board-data-context";
import GameProvider from "./context/game-data-context";
import { ToastProvider } from "./context/toast-context";
import RootLayout from "./pages/RootLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Home />,
    children: [
      { index: true, element: <Home /> },
      { path: "/games", element: <GameList /> },
      {
        path: "/games/:gameId",
        element: (
          <GameProvider>
            <BoardProvider>
              <GameContainer />
            </BoardProvider>
          </GameProvider>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
