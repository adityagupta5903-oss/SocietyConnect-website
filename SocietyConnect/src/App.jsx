
import Home from './homepage/home.jsx'
import Feature from './featurespage/feature.jsx'
import About from './aboutpage/about.jsx'
import Login from './login/login.jsx'
import Member from './memberpage/member.jsx'
import SuperAdmin from './superadminpage/superadmin.jsx'
import Contact from './contactpage/contact.jsx'
import Forgot from './forgotpage/forgot.jsx'
import CreateSociety from './createsocietypage/createsociety.jsx'
import Society from './society/society.jsx'
import {BrowserRouter ,Route, Routes} from 'react-router-dom'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/features' element={<Feature/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/member' element={<Member/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/forgot' element={<Forgot/>}/>
        <Route path='/superadmin' element={<SuperAdmin/>}/>
        <Route path='/society' element={<Society/>}/>
        <Route path='/createsociety' element={<CreateSociety/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
