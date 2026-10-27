import React from 'react';
import { Link } from 'react-router-dom';
import { Logo, Dhruv, type DhruvPose } from '../brand';

/** Split layout for log in, sign up and save-results: brand panel on large screens, form on the right. */
export const AuthShell: React.FC<{
  pose?: DhruvPose;
  panelTitle: string;
  panelBody: string;
  children: React.ReactNode;
}> = ({ pose = 'wave', panelTitle, panelBody, children }) => (
  <div className="flex min-h-screen bg-white">
    <aside className="relative hidden w-[44%] max-w-[560px] flex-col justify-between overflow-hidden bg-royal-500 p-12 text-white lg:flex">
      <Link to="/" aria-label="FuturePath AI home"><Logo tone="light" height={30} /></Link>
      <div className="flex flex-col gap-5">
        <Dhruv pose={pose} size={200} bob decorative />
        <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white">{panelTitle}</h2>
        <p className="max-w-sm text-lg leading-relaxed text-royal-100">{panelBody}</p>
      </div>
      <p className="text-sm text-royal-100">DPDP Act 2023 compliant · We never sell student data</p>
    </aside>
    <main id="main" className="flex flex-1 flex-col">
      <div className="flex h-[72px] items-center px-6 lg:hidden">
        <Link to="/" aria-label="FuturePath AI home"><Logo height={28} /></Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[460px]">{children}</div>
      </div>
    </main>
  </div>
);
