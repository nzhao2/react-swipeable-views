import React from 'react';
import PropTypes from 'prop-types';
import shallowEqual from 'fbjs/lib/shallowEqual';
import { mod, getIndexMax } from '@golden-unicorn/react-swipeable-views-core';

export default function autoPlay(MyComponent) {
  class AutoPlay extends React.Component {
    timer = null;

    isMouseHover = false;

    constructor(props) {
      super(props);
      this.state.index = props.index || 0;
    }

    state = {};

    componentDidMount() {
      this.startInterval();
    }

    componentWillReceiveProps(nextProps) {
      const { index } = nextProps;

      if (typeof index === 'number' && index !== this.props.index) {
        this.setState({
          index,
        });
      }
    }

    componentDidUpdate(prevProps) {
      const shouldResetInterval = !shallowEqual(
        {
          index: prevProps.index,
          interval: prevProps.interval,
          autoplay: prevProps.autoplay,
        },
        {
          index: this.props.index,
          interval: this.props.interval,
          autoplay: this.props.autoplay,
        },
      );

      if (shouldResetInterval) {
        this.startInterval();
      }
    }

    componentWillUnmount() {
      clearInterval(this.timer);
    }

    handleInterval = () => {
      const { children, direction, onChangeIndex, slideCount, visibleSlidesCount } = this.props;

      const indexLatest = this.state.index;
      let indexNew = indexLatest;

      if (direction === 'incremental') {
        indexNew += 1;
      } else {
        indexNew -= 1;
      }

      if (slideCount || children) {
        indexNew = mod(indexNew, slideCount || getIndexMax({ visibleSlidesCount, children }) + 1);
      }

      // Is uncontrolled
      if (this.props.index === undefined) {
        this.setState({
          index: indexNew,
        });
      }

      if (onChangeIndex) {
        onChangeIndex(indexNew, indexLatest);
      }
    };

    handleChangeIndex = (index, indexLatest) => {
      // Is uncontrolled
      if (this.props.index === undefined) {
        this.setState({
          index,
        });
      }

      if (this.props.onChangeIndex) {
        this.props.onChangeIndex(index, indexLatest);
      }
    };

    handleSwitching = (index, type) => {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      } else if (type === 'end') {
        this.startInterval();
      }

      if (this.props.onSwitching) {
        this.props.onSwitching(index, type);
      }
    };

    handleMouseEnter = e => {
      const { onMouseEnter } = this.props;

      this.isMouseHover = true;
      clearInterval(this.timer);

      if (typeof onMouseEnter === 'function') {
        onMouseEnter(e);
      }
    };

    handleMouseLeave = e => {
      const { onMouseLeave } = this.props;
      this.isMouseHover = false;
      this.startInterval();

      if (typeof onMouseLeave === 'function') {
        onMouseLeave(e);
      }
    };

    startInterval() {
      const { autoplay, interval, pauseOnHover } = this.props;

      if (pauseOnHover && this.isMouseHover) {
        return;
      }

      clearInterval(this.timer);

      if (autoplay) {
        this.timer = setInterval(this.handleInterval, interval);
      }
    }

    render() {
      const {
        autoplay,
        direction,
        index: indexProp,
        interval,
        onChangeIndex,
        pauseOnHover,
        ...other
      } = this.props;

      const { index } = this.state;

      if (!autoplay) {
        return <MyComponent index={index} onChangeIndex={onChangeIndex} {...other} />;
      }

      const pauseOnHoverProps = pauseOnHover
        ? {
            onMouseEnter: this.handleMouseEnter,
            onMouseLeave: this.handleMouseLeave,
          }
        : {};

      return (
        <MyComponent
          index={index}
          onChangeIndex={this.handleChangeIndex}
          onSwitching={this.handleSwitching}
          {...other}
          {...pauseOnHoverProps}
        />
      );
    }
  }

  AutoPlay.propTypes = {
    /**
     * If `false`, the auto play behavior is disabled.
     */
    autoplay: PropTypes.bool,
    /**
     * @ignore
     */
    children: PropTypes.node,
    /**
     * This is the auto play direction.
     */
    direction: PropTypes.oneOf(['incremental', 'decremental']),
    /**
     * @ignore
     */
    index: PropTypes.number,
    /**
     * Delay between auto play transitions (in ms).
     */
    interval: PropTypes.number,
    /**
     * @ignore
     */
    onChangeIndex: PropTypes.func,
    /**
     * @ignore
     */
    onSwitching: PropTypes.func,
    /**
     * @ignore
     */
    slideCount: PropTypes.number,
    /**
     * @ignore
     */
    visibleSlidesCount: PropTypes.number,
  };

  AutoPlay.defaultProps = {
    autoplay: true,
    direction: 'incremental',
    interval: 3000,
    visibleSlidesCount: 1,
  };

  return AutoPlay;
}
