import type { AttendanceRecord } from '../types/api';

interface ParticipantTableProps {
  records: AttendanceRecord[];
}

const ParticipantTable = ({ records }: ParticipantTableProps) => (
  <div className="table-container">
    <table className="data-table">
      <thead>
        <tr>
          <th>Participant</th>
          <th>Email</th>
          <th>Department</th>
          <th>Attendance</th>
          <th>Checked in at</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record._id}>
            <td>
              {record.userId?.name?.first} {record.userId?.name?.last}
            </td>
            <td>{record.userId?.email || 'Unknown'}</td>
            <td>{record.userId?.profile?.department || 'N/A'}</td>
            <td>{record.checkIn?.status || 'N/A'}</td>
            <td>{record.checkIn?.checkedInAt ? new Date(record.checkIn.checkedInAt).toLocaleString() : 'Pending'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ParticipantTable;
