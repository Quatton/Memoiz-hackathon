import Head from "next/head";
type Props = {
    title: string
    desc: string
}
const Header = ({ title, desc }: Props) => {
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={desc} />
            <link rel="icon" href="/favicon.ico" />
        </Head>
    );
}

export default Header;