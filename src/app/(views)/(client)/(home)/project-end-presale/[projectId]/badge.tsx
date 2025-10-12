import { Icon } from "@/components/icon";
import Link from "next/link";

const BadgeSocial = (props: { icon: string; url: string; name: string }) => {
  return (
    <Link
      href={props.url}
      target="_blank"
      className="bg-blue-200 text-blue-700 rounded-md px-3 flex items-center gap-1 p-1 text-xs"
    >
      <Icon className="text-lg" name={props.icon} />
      <p>{props.name}</p>
    </Link>
  );
};

const Badge = (props: { icon: string; name: string }) => {
  return (
    <div className="bg-blue-200 text-blue-700 rounded-md px-3 flex items-center gap-1 p-1 text-xs">
      {props.icon && <Icon className="text-lg" name={props.icon} />}
      <p>{props.name}</p>
    </div>
  );
};

export { BadgeSocial, Badge };
