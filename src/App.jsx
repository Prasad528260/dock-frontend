import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';

function App() {
    return (
        <BrowserRouter>
            <div className="flex h-screen bg-gray-950 text-white">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/simulation" element={<Simulation />} />
                        <Route path="/analytics" element={<Analytics />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;