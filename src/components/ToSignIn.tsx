import { signIn } from 'next-auth/react'
import Container from './Container';
import AppName from './AppName';
const ToSignIn = () => {
    return (
        <Container>
            <div className="flex flex-1 flex-col justify-center items-center">
                <AppName />
                <button className="btn mt-6" onClick={() => { void signIn() }}>
                    Sign In
                </button>
            </div>
        </Container>
    );
}

export default ToSignIn;