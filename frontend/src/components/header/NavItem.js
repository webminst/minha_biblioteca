import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

function NavItem({ to, label }) {
    return (
        <NavLink to={to} activeClassName='active'>
            {label}
        </NavLink>
    );
}

NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default NavItem;
