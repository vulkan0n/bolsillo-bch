import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectSyncState } from "@/redux/sync";
import { DisconnectOutlined, CheckCircleFilled } from "@ant-design/icons";
import { animated, useSpring } from "@react-spring/web";

export default function SyncIndicator() {
  const sync = useSelector(selectSyncState);

  return (
    <div className="flex items-center h-full">
      <div className="flex-1 text-primary text-center">
        {!sync.connected && <DisconnectedIcon />}
        {sync.connected && <ConnectedIcon />}
      </div>
    </div>
  );
}

function DisconnectedIcon() {
  const [springs, api] = useSpring(() => ({
    from: { opacity: 0.0333 },
    to: { opacity: 0.333 },
    loop: true,
    delay: 3333,
    config: {
      mass: 33,
      tension: 50,
      friction: 10,
    },
  }));

  return (
    <animated.div style={{ ...springs }}>
      <DisconnectOutlined className="text-error text-2xl" />
    </animated.div>
  );
}

function ConnectedIcon() {
  // connection icon starts bright and dims out
  const [springs, api] = useSpring(() => ({
    from: { opacity: 0.5, scale: 0.85 },
    to: { opacity: 0.05, scale: 0.75 },
    config: {
      mass: 1,
      tension: 1.5,
      friction: 1.75,
    },
  }));

  return (
    <animated.div style={{ ...springs }}>
      <CheckCircleFilled
        style={{ ...springs }}
        className="text-2xl"
        onPointerDown={() =>
          api.start({
            from: { opacity: 0.9, scale: 1.1 },
            to: { opacity: 0.05, scale: 0.75 },
          })
        }
      />
    </animated.div>
  );
}
