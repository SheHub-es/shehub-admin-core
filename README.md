# 👩‍💻 SheHub Data-Infra Project (Frontend)

This project is the **frontend for the applicant management dashboard** built with **Next.js**.

## 🎯 Objective

The main purpose of this dashboard is to provide the **administrator** and the **management team** with a centralized and unified tool to:

* Manage the applicant database.
* Visualize real-time statistics.
* Apply advanced search filters.
* Edit and extend the information of each profile.
* Facilitate administration with a clear and unified interface.

---

## 🚀 Production Deployment

You can access the current production version here:

[https://shehub-admin-core.vercel.app](https://shehub-admin-core.vercel.app)

---

## 🛠️ Technologies Used

This project is built on a modern and efficient stack:

* **Next.js**
* **React**
* **Tailwind CSS**
* **Lucide React** (for icons)
* **TypeScript**

The frontend consumes **backend endpoints** using a **REST API**. Specific API and backend details are located in the backend repository.

---

## 📂 Project Structure

The folder structure follows Next.js and React conventions, facilitating scalability and maintenance:
src/
├── app/
│   ├── applicants/ (page.tsx for the main route)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AdminRecordsTable.tsx
│   ├── AnimatedLogo.tsx
│   ├── ApplicantForm.tsx
│   ├── ApplicantList.tsx
│   ├── Greeting.tsx
│   ├── LoginForm.tsx
│   ├── Notifications.tsx
│   ├── ProfileModal.tsx
│   └── SearchAndFilters.tsx
├── features/ (For business logic or specific modules)
├── hooks/
│   ├── useApplicantFilter.ts
│   ├── useApplicants.ts
│   └── useApplicantState.ts
├── lib/
│   └── applicants.ts (Utilities)
├── types/
│   └── applicants.ts (TypeScript definitions)
└── services/
└── admin.api.ts (Backend communication module)

Other relevant files: .env, next.config.js, tailwind.config.ts, tsconfig.json

---

## ⚙️ Installation and Local Development

Follow these steps to get the project running on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)<ORGANIZATION>/shehub-data-infra-project.git
    ```
2.  **Enter the project folder:**
    ```bash
    cd shehub-data-infra-project
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  **Open in the browser:**
    Access [http://localhost:3000](http://localhost:3000).

### Environment Variables

You must create a **`.env.local`** file in the project root to define the necessary URLs and keys for backend communication.

**Example of `.env.local`:**
NEXT_PUBLIC_API_BASE_URL=https://api.mycompany.com


---

## 👤 User Roles

The system is currently designed for the following roles:

* **Administrator / SuperAdmin:** Full access to the dashboard and all data management functionalities.
* **Future:** Login implementation for external users is planned (pending).

---

## 🌍 Deployment

* The frontend is deployed **independently** of the backend.
* The final production configuration and data migration are done in conjunction with the backend on a DigitalOcean droplet. For server details, consult the backend repository.

---

## 🚦 Project Status

* **Development:** Completed.
* **Production Deployment:** In progress (September 2025).

---

## 🤝 Contributions

Contributions are welcome! Follow these steps:

1.  **Fork** the repository.
2.  Create a branch for your *feature* or *fix*:
    ```bash
    git checkout -b feature/new-feature-name
    ```
3.  Commit your changes:
    ```bash
    git commit -m "feat: concise description of the feature"
    ```
4.  Push the branch and open a **Pull Request (PR)**.

---

## 📚 Useful Next.js Resources

* [Official Next.js Documentation](https://nextjs.org/docs)
* [Interactive Next.js Tutorial](https://nextjs.org/learn)
* [Next.js GitHub Repository](https://github.com/vercel/next.js)
