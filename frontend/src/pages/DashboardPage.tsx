/**
 * Dashboard page for professionals
 * Edit profile, services, pricing
 */
import { useState } from 'react'
import { motion } from 'framer-motion'

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    fullName: 'Jane Doe',
    professionalTitle: 'Yoga Instructor',
    location: 'San Francisco, CA',
    email: 'jane.doe@example.com',
    bio: 'I am a certified yoga instructor with over 10 years of experience, specializing in Vinyasa and Restorative yoga. My practice is centered around creating a safe and welcoming space for students of all levels to explore the connection between mind, body, and breath.',
    services: [
      { name: 'Vinyasa Flow Yoga', price: 75 },
      { name: 'Restorative Yoga Session', price: 90 }
    ]
  })

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', price: 0 }]
    })
  }

  const updateService = (index: number, field: string, value: string | number) => {
    const updatedServices = formData.services.map((service, i) =>
      i === index ? { ...service, [field]: value } : service
    )
    setFormData({ ...formData, services: updatedServices })
  }

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light dark:bg-background-dark">
      {/* Header is already included in App.tsx */}

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-28 flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-4 p-4">
                <div className="relative group">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-28 border-4 border-white dark:border-[#2a3f34] shadow-md"
                    style={{
                      backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmmERGYXMdWyDRvCoMoGT8wsCudBrbcqSIyW7aVAFFhZmAjIf7cawAN9cz4qtkbkp5hWVpNEfsDFb0ox5R6LDbAMG9jC04rW3Y1fUJT32nzxtKcorXCNwRBGJWp8JXy8lIPNURFkIcK-FzlxDiUi3xW3VwYLx48oD6NdIbab5otxoTAGRhgy8oGvbM_IZ0hy_gmrHZt7fGoORiSyiMOKfNegkWqEqtE_VJimkFugFQG7AwPgs4Wl7AHWmmy43ZKp0rFaoOMyDq5w")'
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-white text-3xl">edit</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[#111814] dark:text-white text-xl font-bold leading-normal">{formData.fullName}</h1>
                  <p className="text-[#618975] dark:text-gray-400 text-base font-normal leading-normal">{formData.professionalTitle}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                    activeTab === 'profile'
                      ? 'bg-[#f0f4f2] dark:bg-primary/20'
                      : 'hover:bg-[#f0f4f2] dark:hover:bg-primary/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[#111814] dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  <p className="text-[#111814] dark:text-white text-sm font-medium leading-normal">Edit Profile</p>
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                    activeTab === 'bookings'
                      ? 'bg-[#f0f4f2] dark:bg-primary/20'
                      : 'hover:bg-[#f0f4f2] dark:hover:bg-primary/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[#111814] dark:text-white">calendar_month</span>
                  <p className="text-[#111814] dark:text-white text-sm font-medium leading-normal">My Bookings</p>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                    activeTab === 'settings'
                      ? 'bg-[#f0f4f2] dark:bg-primary/20'
                      : 'hover:bg-[#f0f4f2] dark:hover:bg-primary/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[#111814] dark:text-white">settings</span>
                  <p className="text-[#111814] dark:text-white text-sm font-medium leading-normal">Account Settings</p>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            <div className="flex flex-wrap justify-between gap-3 items-baseline">
              <p className="text-[#111814] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Edit Your Profile</p>
            </div>

            {/* Personal Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#182c22] rounded-xl shadow-sm p-6"
            >
              <h2 className="text-[#111814] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-5">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col flex-1">
                  <p className="text-[#111814] dark:text-gray-300 text-base font-medium leading-normal pb-2">Full Name</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111814] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe6e0] dark:border-[#2a3f34] bg-white dark:bg-[#102219] focus:border-primary/50 h-14 placeholder:text-[#618975] p-[15px] text-base font-normal leading-normal transition-all"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </label>
                <label className="flex flex-col flex-1">
                  <p className="text-[#111814] dark:text-gray-300 text-base font-medium leading-normal pb-2">Professional Title</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111814] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe6e0] dark:border-[#2a3f34] bg-white dark:bg-[#102219] focus:border-primary/50 h-14 placeholder:text-[#618975] p-[15px] text-base font-normal leading-normal transition-all"
                    value={formData.professionalTitle}
                    onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                  />
                </label>
                <label className="flex flex-col flex-1">
                  <p className="text-[#111814] dark:text-gray-300 text-base font-medium leading-normal pb-2">Location</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111814] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe6e0] dark:border-[#2a3f34] bg-white dark:bg-[#102219] focus:border-primary/50 h-14 placeholder:text-[#618975] p-[15px] text-base font-normal leading-normal transition-all"
                    placeholder="City, State/Country"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </label>
                <label className="flex flex-col flex-1">
                  <p className="text-[#111814] dark:text-gray-300 text-base font-medium leading-normal pb-2">Contact Email</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111814] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe6e0] dark:border-[#2a3f34] bg-white dark:bg-[#102219] focus:border-primary/50 h-14 placeholder:text-[#618975] p-[15px] text-base font-normal leading-normal transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </label>
              </div>
            </motion.div>

            {/* About Me Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#182c22] rounded-xl shadow-sm p-6"
            >
              <h2 className="text-[#111814] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-5">About Me</h2>
              <label className="flex flex-col w-full">
                <p className="text-[#111814] dark:text-gray-300 text-base font-medium leading-normal pb-2">Professional Bio</p>
                <textarea
                  className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-[#111814] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe6e0] dark:border-[#2a3f34] bg-white dark:bg-[#102219] focus:border-primary/50 placeholder:text-[#618975] p-[15px] text-base font-normal leading-normal transition-all"
                  rows={6}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </label>
            </motion.div>

            {/* Services Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#182c22] rounded-xl shadow-sm p-6"
            >
              <div className="flex justify-between items-center pb-5">
                <h2 className="text-[#111814] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Services &amp; Pricing</h2>
                <button
                  onClick={addService}
                  className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary text-sm font-bold leading-normal tracking-[0.015em] transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  <span className="truncate">Add Service</span>
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {formData.services.map((service, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-lg bg-background-light dark:bg-[#102219]">
                    <div className="flex-1 w-full">
                      <p className="text-[#111814] dark:text-gray-300 text-sm font-medium leading-normal pb-1">Service Name</p>
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#111814] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary/50 border border-[#dbe6e0] dark:border-[#2a3f34] bg-white dark:bg-[#182c22] focus:border-primary/50 h-12 p-3 text-base font-normal leading-normal transition-all"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-40">
                      <p className="text-[#111814] dark:text-gray-300 text-sm font-medium leading-normal pb-1">Price ($)</p>
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#111814] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary/50 border border-[#dbe6e0] dark:border-[#2a3f34] bg-white dark:bg-[#182c22] focus:border-primary/50 h-12 p-3 text-base font-normal leading-normal transition-all"
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <button
                      onClick={() => removeService(index)}
                      className="self-end p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
