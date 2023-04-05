import { CgSpinner } from 'react-icons/cg'
import Container from './Container';

const Loading = () => {
    return (
        <Container>
            <CgSpinner size={32} className="animate-spin" />
        </Container>
    );
}

export default Loading;