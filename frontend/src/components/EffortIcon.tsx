import { effortOptions } from '@/utils/utils';
import { SvgIconProps } from '@mui/material';
import SignalCellular1BarIcon from '@mui/icons-material/SignalCellular1Bar';
import SignalCellular3BarIcon from '@mui/icons-material/SignalCellular3Bar';
import SignalCellular4BarIcon from '@mui/icons-material/SignalCellular4Bar';
import SignalCellularConnectedNoInternet0BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0Bar';

interface EffortIconProps extends SvgIconProps {
  effort: string;
}

/**
 * Show an icon representing the effort level of a request.
 */
export const EffortIcon: React.FC<EffortIconProps> = ({ effort, ...otherProps }) => {
  if (effort === effortOptions[0]) {
    return <SignalCellular1BarIcon {...otherProps} />;
  } else if (effort === effortOptions[1]) {
    return <SignalCellular3BarIcon {...otherProps} />;
  } else if (effort === effortOptions[2]) {
    return <SignalCellular4BarIcon {...otherProps} />;
  } else {
    return <SignalCellularConnectedNoInternet0BarIcon {...otherProps} />;
  }
};
