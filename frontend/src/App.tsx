import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
function App() {


  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
    </>
  )
}

export default App
