// import { Typography } from '@material-ui/core';
//
// import * as React from 'react';
// import { RouteComponentProps, withRouter } from 'react-router-dom';
// import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';
//
// import * as api from '../../../api';
// import * as model from '../../../model';
//
// interface AdminsProps extends RouteComponentProps, InjectedFormProps {
//   coursePk: number;
// }
//
// const Admins: React.FC<AdminsProps> = props => {
//   const [adminUsers, setAdminUsers] = React.useState<model.User[]>([]);
//   const [users, setUsers] = React.useState<model.User[]>([]);
//
//   React.useEffect(() => {
//     api.courses
//       .getCourse(props.coursePk)
//       .then(res => {
//         setAdminUsers(res.users.filter((user: model.User) => user.is_admin));
//         setUsers(res.users.filter((user: model.User) => !user.is_admin));
//       })
//       .catch((err: Error) => {
//         switch (err.constructor) {
//           case api.errors.UnAuthorizedError:
//             props.history.push(`/login`);
//             return;
//           default:
//             props.history.push(`/courses/${props.coursePk}`);
//             return;
//         }
//       });
//   }, [adminUsers.length]);
//
//   return (
//     <form style={{ marginTop: 50 }}>
//       <Typography variant="h5" style={{ marginBottom: 15 }}>
//         管理者一覧
//       </Typography>
//     </form>
//   );
// };
//
// export default reduxForm({ form: 'adminAdminListForm' })(withRouter(Admins));
