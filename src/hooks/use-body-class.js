// hooks/useBodyClass.js
import { useEffect } from 'react';

export default function useBodyClass(className, deps = []) {
    useEffect(() => {
        document.body.classList.add(className);
        return () => document.body.classList.remove(className);
    }, deps);
}