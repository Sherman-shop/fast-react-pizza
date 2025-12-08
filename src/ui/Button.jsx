import { Link } from 'react-router-dom'


export default function Button({ children, disabled, to}) {
  const className='bg-yellow-400 font-semibold text-stone-800 py-3 px-4 inline-block uppercase tracking-wide rounded-full hover:bg-yellow-300 transition-colors duration-500 disabled:cursor-not-allowed md:px-6 md:py-4';
  
    if(to) return <Link to={to} className={className}>{children}</Link>
  return (
    <button disabled={disabled} className={className}>
        {children}
    </button>
  )
}
