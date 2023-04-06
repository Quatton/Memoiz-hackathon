import Link from "next/link";
import { UserCard } from "./user_card";

const Nav = ({ breads }: { breads: { title: string; path: string }[] }) => {
  return (
    <div className="navbar fixed top-0 z-50 bg-base-300 px-5 shadow-md">
      <Link
        href={"/"}
        className="btn-ghost btn mr-4 pb-1 font-logo text-3xl normal-case"
      >
        Memoiz
      </Link>
      {/* <div className="logo navbar-start text-3xl font-semibold">Diary</div> */}

      <div className="navbar-start breadcrumbs text-sm">
        <ul>
          {breads &&
            breads.map((bread, idx) => {
              return (
                <li key={`bread-${idx}`} className="hidden">
                  <Link href={bread.path}>{bread.title}</Link>
                </li>
              );
            })}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <UserCard />
      </div>
    </div>
  );
};

export default Nav;
