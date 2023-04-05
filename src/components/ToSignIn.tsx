import { signIn } from 'next-auth/react'
import Container from './Container';
import AppName from './AppName';
const ToSignIn = () => {
    return (
        <Container>
            <AppName />
            <button className="btn mt-6" onClick={() => { void signIn() }}>
                Sign In
            </button>
        </Container>
    );
}

export default ToSignIn;