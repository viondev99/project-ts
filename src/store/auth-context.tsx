import React, { useContext } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { postAuth, putAuth, getAuth } from '../services/index'
import {
  clear,
  loadFromStorage,
  saveToStorage,
} from '../common/utils/index'

interface AuthContextType {
  signup?: (user: UserSign, callback: VoidFunction) => Promise<void>;
  signin?: (user: UserSign, callback: VoidFunction) => Promise<void>;
  signout?: () => void;
  changeProfile?: (user: ChangeProfile, callback: VoidFunction) => Promise<void>;
  getUserInfor?: () => Promise<void>;
  user?: (AndInterFace);
  isUserLoggedIn: Boolean;
}

type OrInterFace = UserSign | ChangeProfile | UserAccessToken
type AndInterFace = UserSign & ChangeProfile & UserAccessToken

interface UserSign {
  email: string;
  password: string;
}

interface ChangeProfile {
  id?: number
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
}

interface UserAccessToken {
  access_token: string;
}

export const AuthContext = React.createContext<AuthContextType>(null!)

export function AuthProvider({ children } : { children: React.ReactNode }) {
  const [user, setUser] = React.useState<any>(loadFromStorage('User'))

  const signup = async (user: UserSign, callback: () => void) => {
    const data = { email: user.email, password: user.password }
    const params = 1
    const headers = 2
    await postAuth(
      'http://localhost:3000/api/v1/auth/signup',
      data,
      params,
      headers
    )
    callback()
  }

  const signin = async (newUser: UserSign , callback: () => void) => {
    const data = { email: newUser.email, password: newUser.password }
    const params = 1
    const headers = 2
    const response = await postAuth(
      'http://localhost:3000/api/v1/auth/login',
      data,
      params,
      headers
    )

    setUser({ ...response.data.data, email: newUser.email })

    saveToStorage('User', { ...response.data.data, email: newUser.email })

    callback()
  }

  const signout = () => {
    setUser({ email: null, password: null, id: null })
    clear()
  }

  const changeProfile = async (newUser: ChangeProfile, callback: () => void) => {
    try {
      const data = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        address1: newUser.address1,
        address2: newUser.address2,
      }
      const params = 1
      const headers = 2
      await putAuth('http://localhost:3000/api/v1/user', data, params, headers)
      callback()
    } catch (error) {
      console.log(error)
    }
    
  }

  const getUserInfor = async () => {
    const params = 1
    const headers = 2
    const response: OrInterFace = await getAuth('http://localhost:3000/api/v1/user', params, headers)
    const dataUser = loadFromStorage('User')
    const updateDataUser = {
      access_token: dataUser.access_token,
      ...response,
    }

    setUser(updateDataUser)
    saveToStorage('User', updateDataUser)
  }

  const isUserLoggedIn = Boolean(user?.access_token)

  const value = {
    signup,
    signin,
    signout,
    changeProfile,
    getUserInfor,
    user,
    isUserLoggedIn,
  }
  
  console.log(AuthContext)
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

}

export function RequireAuth({ children } : {children: React.ReactElement}) {
  const auth = useContext(AuthContext)
  const location = useLocation()

  if (!auth.isUserLoggedIn) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}
