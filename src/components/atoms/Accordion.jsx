import PropTypes from "prop-types";
import { useState } from "react";
import { CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";

export default function Accordion({ icon, title, children, open }) {
  const [isOpen, setIsOpen] = useState(open);
  const Icon = icon;

  return (
    <div className="bg-zinc-800 rounded-lg p-2 my-1 text-zinc-200">
      <button
        type="button"
        tabIndex={0}
        className="text-lg font-medium p-1 flex items-center w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex-1 flex items-center">
          <Icon className="text-xl text-primary mr-1.5" />
          <span>{title}</span>
        </span>
        {isOpen ? <CaretDownOutlined /> : <CaretRightOutlined />}
      </button>
      {isOpen && (
        <div className="mt-1 text-zinc-700 rounded-sm bg-zinc-200 divide-y divide-zinc-300">
          {children}
        </div>
      )}
    </div>
  );
}

Accordion.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  children: PropTypes.node,
  open: PropTypes.bool,
};

Accordion.defaultProps = {
  icon: () => null,
  title: "",
  children: () => null,
  open: false,
};

function AccordionChild({ icon, label, children }) {
  const Icon = icon || (() => null);
  return (
    <div className="p-3">
      <div className="flex justify-between items-center">
        {label && (
          <div className="flex flex-1 items-center flex-nowrap items-center">
            <Icon className="text-xl mr-1" />
            {label}
          </div>
        )}
        <div className="flex-1 text-right">{children}</div>
      </div>
    </div>
  );
}

AccordionChild.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  children: PropTypes.node,
};

AccordionChild.defaultProps = {
  icon: () => null,
  label: "",
  children: () => null,
};

Accordion.Child = AccordionChild;
