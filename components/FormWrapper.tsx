import React from 'react';

interface FormWrapperProps {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  children: React.ReactNode;
}

const FormWrapper: React.FC<FormWrapperProps> = ({ title, icon, colorClass, children }) => (
  <div className="p-4 sm:p-6 md:p-8">
    <div className={`max-w-2xl mx-auto rounded-lg shadow-xl overflow-hidden border border-brand-steel`}>
      <header className={`${colorClass} text-white p-4 flex items-center`}>
        <div className="mr-3">{icon}</div>
        <h2 className="text-xl font-bold">{title}</h2>
      </header>
      <div className="p-6 bg-brand-lead">
        {children}
      </div>
    </div>
  </div>
);

export default FormWrapper;