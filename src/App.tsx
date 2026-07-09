/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const Episode = lazy(() => import('./pages/Episode'));
const About = lazy(() => import('./pages/About'));
const Profile = lazy(() => import('./pages/Profile'));
const Variety = lazy(() => import('./pages/Variety'));
const Partners = lazy(() => import('./pages/Partners'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="episode/:id" element={<Episode />} />
          <Route path="about" element={<About />} />
          <Route path="profile" element={<Profile />} />
          <Route path="variety" element={<Variety />} />
          <Route path="partners" element={<Partners />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
