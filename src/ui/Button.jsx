import { Link } from 'react-router-dom'


export default function Button({ children, disabled, to, type}) {
  const base='bg-yellow-400 font-semibold text-sm text-stone-800  inline-block uppercase tracking-wide rounded-full hover:bg-yellow-300 focus:bg-yellow-300 transition-colors duration-500 disabled:cursor-not-allowed'
  const styles = {
    primary:base + ' py-3 px-4 md:px-6 md:py-4',
    small:base + " px-4 py-2 md:px-5 md:py-2.5 text-xs",
    secondary:' font-semibold text-sm text-stone-400 py-2.5 px-4 md:px-6 md:py-3.5 border-2 border-stone-300 inline-block uppercase tracking-wide rounded-full hover:bg-stone-300 focus:bg-stone-300 focus:outline-none hover:text-stone-800 focus:ring-stone-200 transition-colors duration-500 disabled:cursor-not-allowed'
  }

    if(to) return <Link to={to} className={styles[type]}>{children}</Link>
  return (
    <button disabled={disabled} className={styles[type]}>
        {children}
    </button>
  )
}
