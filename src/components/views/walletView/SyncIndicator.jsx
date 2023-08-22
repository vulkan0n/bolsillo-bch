import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  DisconnectOutlined,
  CheckCircleFilled,
  SyncOutlined,
} from "@ant-design/icons";
import { animated, useSpring } from "@react-spring/web";
import { selectSyncState } from "@/redux/sync";

export default function SyncIndicator() {
  const sync = useSelector(selectSyncState);

  const [syncTimeout, setSyncTimeout] = useState(null);

  const [syncSprings] = useSpring(() => ({
    from: { opacity: 1, scale: 1.1 },
    to: { opacity: 0.5, scale: 1.0 },
    immediate: true,
  }));

  useEffect(
    function gracefulSyncIndicator() {
      if (sync.isSyncing) {
        if (syncTimeout === null) {
          setSyncTimeout(
            setTimeout(() => {
              setSyncTimeout(null);
            }, 1000)
          );
        }
      }
    },
    [sync.isSyncing, syncTimeout]
  );

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
    immediate: true,
    config: {
      mass: 0.6,
      tension: 80,
      friction: 50,
    },
  }));

  const handlePointerDown = () => {
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
    <div
      className="cursor-pointer w-10 h-10 flex justify-center items-center"
      onPointerDown={handlePointerDown}
    >
      {!sync.connected && (
        <DisconnectedIcon springs={{ ...disconnectSprings }} />
      )}
      {sync.connected &&
        (syncTimeout !== null ? (
          <SyncIcon springs={{ ...syncSprings }} />
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
DisconnectedIcon.propTypes = {
  springs: PropTypes.object.isRequired,
};

function ConnectedIcon({ springs }) {
  return (
    <animated.div style={springs}>
      <CheckCircleFilled className="text-primary text-3xl text-center" />
    </animated.div>
  );
}

ConnectedIcon.propTypes = {
  springs: PropTypes.object.isRequired,
};

function SyncIcon({ springs }) {
  return (
    <animated.div style={springs}>
      <SyncOutlined className="text-info text-xl opacity-50" spin />
    </animated.div>
  );
}
SyncIcon.propTypes = {
  springs: PropTypes.object.isRequired,
};
