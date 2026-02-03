import { useState } from 'react';
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import type { Employee } from "./types";

export function AdminEmployeeView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDepartment, setSelectedDepartment] = useState('Alle avdelinger');
    const [selectedStatus, setSelectedStatus] = useState('Alle statuser');

    const itemsPerPage = 8;

    // Mock data as requested
    const employees: Employee[] = [
        {
            id: '1',
            name: 'Olav Nordmann',
            email: 'olav@plenpilot.no',
            role: 'Bruker',
            department: 'Uteseksjonen',
            status: 'Aktiv',
            lastActive: '2 minutter siden',
            avatar: ''
        }
    ];

    const filteredEmployees = employees.filter(emp =>
        (selectedDepartment === 'Alle avdelinger' || emp.department === selectedDepartment) &&
        (selectedStatus === 'Alle statuser' || emp.status === selectedStatus) &&
        (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ansatte</h1>
                    <p className="text-sm text-gray-500 mt-1">Administrer teammedlemmer, roller og status.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                        variant="secondary"
                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
                    >
                        Eksportliste
                    </Button>
                    <Button
                        variant="primary"
                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
                    >
                        Legg til ansatt
                    </Button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                {/* Filters Toolbar */}
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                        {/* Search */}
                        <div className="relative w-full sm:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                placeholder="Søk via navn eller e-post"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Dropdowns */}
                        <div className="flex gap-3">
                            <select
                                className="block w-full sm:w-auto pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                <option>Alle avdelinger</option>
                                <option>Uteseksjonen</option>
                                <option>Administrasjon</option>
                            </select>

                            <select
                                className="block w-full sm:w-auto pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option>Alle statuser</option>
                                <option>Aktiv</option>
                                <option>Inaktiv</option>
                            </select>
                        </div>
                    </div>

                    {/* Sort By */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <span className="text-sm text-gray-500">Sorter etter:</span>
                        <select className="pl-2 pr-8 py-2 border-none bg-transparent text-sm font-medium text-gray-900 focus:ring-0 cursor-pointer">
                            <option>Sist aktiv</option>
                            <option>Navn</option>
                            <option>Rolle</option>
                        </select>
                    </div>
                </div>

                {/* Table (Desktop) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-8">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Navn
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Rolle
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Avdeling
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Sist Aktiv
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Handlinger</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedEmployees.length > 0 ? (
                                paginatedEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-9 w-9">
                                                    {employee.avatar ? (
                                                        <img className="h-9 w-9 rounded-full object-cover" src={employee.avatar} alt="" />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                                                            {employee.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                    <div className="text-sm text-gray-500">{employee.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{employee.role}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{employee.department}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{employee.lastActive}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={employee.status === 'Aktiv' ? 'success' : 'neutral'}>
                                                {employee.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Ingen ansatte funnet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                    {paginatedEmployees.length > 0 ? (
                        paginatedEmployees.map((employee) => (
                            <div key={employee.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {employee.avatar ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={employee.avatar} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                    {employee.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{employee.name}</h3>
                                            <p className="text-sm text-gray-500">{employee.role}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-blue-600 p-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="text-gray-500">{employee.department}</div>
                                    <Badge variant={employee.status === 'Aktiv' ? 'success' : 'neutral'}>
                                        {employee.status}
                                    </Badge>
                                </div>
                                <div className="text-xs text-gray-400 text-right">
                                    Sist aktiv: {employee.lastActive}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            Ingen ansatte funnet.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Viser <span className="font-medium text-gray-900">{filteredEmployees.length > 0 ? startIndex + 1 : 0}</span> til <span className="font-medium text-gray-900">{Math.min(startIndex + itemsPerPage, filteredEmployees.length)}</span> av <span className="font-medium text-gray-900">{filteredEmployees.length}</span> ansatte
                            </p>
                        </div>
                        <div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Forrige
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Neste
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
