import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectSyncState } from "@/redux/sync";
import { DisconnectOutlined, CheckCircleFilled, SyncOutlined } from "@ant-design/icons";
import { animated, useSpring } from "@react-spring/web";

export default function SyncIndicator() {
  const sync = useSelector(selectSyncState);
  const [disconnectSprings, disconnectApi] = useSpring(() => ({
    from: { opacity: 0.0333 },
    to: { opacity: 0.667 },
    loop: true,
    delay: 3333,
    config: {
      mass: 33,
      tension: 50,
      friction: 10,
    },
  }));

  // connection icon starts bright and dims out
  const [connectSprings, connectApi] = useSpring(() => ({
    from: { opacity: 0.5, scale: 0.75 },
    to: { opacity: 0.1, scale: 0.65 },
    config: {
      mass: 1,
      tension: 1.5,
      friction: 1.75,
    },
  }));

  const handlePointerDown = (event) => {
    if (sync.connected) {
      connectApi.start({
        from: { opacity: 0.8, scale: 0.85 },
        to: { opacity: 0.1, scale: 0.65 },
      });
    } else {
      disconnectApi.start();
    }
  };

  return (
    <div className="flex-1 text-center" onPointerDown={handlePointerDown}>
      {!sync.connected && (
        <DisconnectedIcon springs={{ ...disconnectSprings }} />
      )}
      {sync.connected &&
        (sync.isSyncing ? (
          <SyncOutlined className="text-info text-xl opacity-30" spin />
        ) : (
          <ConnectedIcon springs={{ ...connectSprings }} />
        ))}
    </div>
  );
}

function DisconnectedIcon({ springs }) {
  return (
    <animated.div style={springs}>
      <DisconnectOutlined className="text-error text-2xl text-center" />
    </animated.div>
  );
}

function ConnectedIcon({ springs }) {
  return (
    <animated.div style={springs}>
      <CheckCircleFilled className="text-primary text-3xl text-center" />
    </animated.div>
  );
}
