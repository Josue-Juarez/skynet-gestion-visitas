import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setMensaje('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return setMensaje(` ${error.message}`)

    const user = data.user

    // Consultar el rol del usuario
    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('rol_id')
      .eq('id', user.id)
      .single()

    if (perfilError || !perfil) {
      return setMensaje(' No se pudo obtener el rol del usuario')
    }

    // Redirigir según el rol
    switch (perfil.rol_id) {
      case 1:
        navigate('/admin/dashboard')
        break
      case 2:
        navigate('/supervisor/dashboard')
        break
      case 3:
        navigate('/tecnico/dashboard')
        break
      default:
        setMensaje(' Rol no reconocido')
    }
  }

  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <input className="w-full mb-2 p-2 border rounded" placeholder="Correo" type="email" onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full mb-4 p-2 border rounded" placeholder="Contraseña" type="password" onChange={(e) => setPassword(e.target.value)} />
          <button className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700">
            Entrar
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">{mensaje}</p>
      </div>
    </div>
  )
}