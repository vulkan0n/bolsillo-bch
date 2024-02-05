import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  DisconnectOutlined,
  CheckCircleFilled,
  SyncOutlined,
} from "@ant-design/icons";
import { animated, useSpring } from "@react-spring/web";
import { selectSyncState, syncHotRefresh } from "@/redux/sync";
import ToastService from "@/services/ToastService";

export default function SyncIndicator() {
  const dispatch = useDispatch();
  const sync = useSelector(selectSyncState);

  const [shouldAnimateSync, setShouldAnimateSync] = useState(sync.isSyncing);
  const syncTimeoutRef = useRef();

  const [syncSprings] = useSpring(() => ({
    from: { opacity: 1, scale: 1.1 },
    to: { opacity: 0.5, scale: 1.0 },
    immediate: true,
  }));

  // make the sync spinner smoother by forcing it to play for a minimum time
  useEffect(
    function gracefulSyncIndicator() {
      if (sync.syncCount > 0) {
        requestAnimationFrame(() => setShouldAnimateSync(true));
      }

      if (!sync.isSyncing) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(
          () => requestAnimationFrame(() => setShouldAnimateSync(false)),
          1337
        );
      }
    },
    [sync.syncCount, sync.isSyncing]
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

      dispatch(syncHotRefresh());
      ToastService().connectionStatus(sync);
    } else {
      disconnectApi.start();
      ToastService().disconnected();
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
        (shouldAnimateSync ? (
          <div>
            <SyncIcon springs={{ ...syncSprings }} />
            {/*<div className="text-xs text-zinc-600">
              {sync.syncCount}
            </div>*/}
          </div>
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
