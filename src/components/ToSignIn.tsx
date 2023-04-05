import { signIn } from 'next-auth/react'
import Container from './Container';
const ToSignIn = () => {
    return (
        <Container>
            <div className="flex flex-col justify-center items-center">
                <h1 className="text-white text-4xl font-bold">APP NAME</h1>
                <h1 className="text-white text-lg">description...</h1>
            </div>
            <button className="btn" onClick={() => { void signIn() }}>
                Sign In
            </button>
        </Container>
    );
}

export default ToSignIn;