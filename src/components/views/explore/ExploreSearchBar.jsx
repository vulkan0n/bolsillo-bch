import { useState } from "react";
import { useSelector } from "react-redux";
import { SearchOutlined } from "@ant-design/icons";
import { selectIsExperimental } from "@/redux/preferences";

export default function ExploreSearchBar() {
  const isExperimental = useSelector(selectIsExperimental);

  const [searchText, setSearchText] = useState("");

  const handleSearchTextChange = (event) => {
    const search = event.target.value;
    setSearchText(search);

    // search for addresses and transactions instantly if valid

    // if search input is a number, assume it's a block height
    const canBeBlock =
      Number.isInteger(Number.parseInt(search, 10)) || search.startsWith("#"); // e.g. #478559, 478559
  };

  return isExperimental ? (
    <div className="border border-primary shadow bg-primary text-white">
      <div className="flex justify-center items-center p-2">
        <SearchOutlined className="text-2xl" />
        <input
          type="text"
          placeholder="Search"
          className="w-full ml-2 p-2 border border-primary rounded-md shadow-inner"
          onChange={handleSearchTextChange}
          value={searchText}
        />
      </div>
    </div>
  ) : null;
}
