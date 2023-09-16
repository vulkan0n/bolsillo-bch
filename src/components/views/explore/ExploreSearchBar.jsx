import { SearchOutlined } from "@ant-design/icons";

export default function ExploreSearchBar() {
  return (
    <div className="border border-primary shadow bg-primary text-white">
      <div className="flex justify-center items-center p-2">
        <SearchOutlined className="text-2xl" />
        <input
          type="text"
          placeholder="Search"
          className="w-full ml-2 p-2 border border-primary rounded-md shadow-inner"
        />
      </div>
    </div>
  );
}
