import { Box, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { selectAllLogs } from "../redux/logsSlice";
import { RootState } from "../redux/store";

const Logs = (): JSX.Element => {

    const logs = useSelector((state: RootState) => selectAllLogs(state));
    const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
        hour: 'numeric', 
        minute: 'numeric',
        hour12: false
    })
    const messagesEndRef = React.useRef<null | HTMLDivElement>(null);

    React.useEffect(() => { 
        scrollToBottom();
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: 'nearest', inline: 'start' })
    }

    return (
        <Box mt={2} sx={{
            border: 1,
            borderRadius: 1,
            height: 200,
            p: 1,
            overflow: "auto"
        }}>
            {logs.map((log) => 
            <Typography key={log.id}>[{dateTimeFormat.format(new Date(log.createdTime))}] {log.value}</Typography>
            )}
            <div ref={messagesEndRef} />
        </Box>
    );
};

export default Logs;