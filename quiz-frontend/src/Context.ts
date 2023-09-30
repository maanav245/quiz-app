import { createContext } from 'react';
import {TokenType } from './types/TokenObject'
export const userContext = createContext<TokenType>({token: "", setToken: function(){}});