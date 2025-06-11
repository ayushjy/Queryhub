import React, { useEffect, useState, useRef } from 'react';
import { FiChevronDown, FiLogOut, FiMail } from 'react-icons/fi';

const AdminDashboard = ({ user, setUser }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const backendUrl = 'http://localhost:5000';

  // Fetch files on mount
  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line
  }, []);

  // Close profile popup on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/admin/files', {
        credentials: 'include',
      });
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Failed to fetch files', err);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
  if (!selectedFile) return;
  setUploading(true);
  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    setSelectedFile(null);
    setFiles(data.files || []); // <-- update files state directly
  } catch (err) {
    console.error(err);
  } finally {
    setUploading(false);
  }
};

  const handleDelete = async (filename) => {
    try {
      const res = await fetch(`/api/admin/files/${filename}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shadow-lg bg-opacity-80 bg-gray-900/80">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-pink-500"
            onClick={() => setProfileOpen((v) => !v)}
            aria-label="Profile"
          >
            <span className="font-semibold truncate max-w-[120px]">{user.username}</span>
            <FiChevronDown className="text-lg" />
          </button>
          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 animate-fadeIn">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                    {user.username?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{user.username}</div>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <FiMail className="mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-left text-red-500 hover:bg-gray-700 transition rounded-b-lg"
              >
                <FiLogOut className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto py-8 px-4">
        {/* Upload Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="bg-gray-700 p-2 rounded w-full sm:w-auto"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded shadow hover:from-pink-500 hover:to-purple-500 transition font-semibold disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </section>

        {/* File List */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          {files.length === 0 ? (
            <p className="text-gray-400">No files uploaded yet.</p>
          ) : (
            <ul className="space-y-3">
              {files.map((file) => (
                <li
                  key={file}
                  className="bg-gray-800 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <span className="truncate max-w-xs">{file}</span>
                  <button
                    onClick={() => handleDelete(file)}
                    className="mt-2 sm:mt-0 px-4 py-1 bg-red-600 rounded hover:bg-red-500 transition font-semibold"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;