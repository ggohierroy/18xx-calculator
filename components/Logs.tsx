import { Box, Typography } from "@mui/material";
import { Log } from "@prisma/client";
import React from "react";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

type LogsProps = {
    gameId: Number
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | undefined
}

const Logs = ({ gameId, socket }: LogsProps): JSX.Element => {
    const [logs, setLogs] = React.useState<Log[]>();
    const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
        hour: 'numeric', 
        minute: 'numeric',
        hour12: false
    })
    const messagesEndRef = React.useRef<null | HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: 'nearest', inline: 'start' })
    }
    React.useEffect(() => { 
        if(!socket)
            return;
        fetchLogs();
        socket.on('log-created', (log: Log) => {
            setLogs(logs => {
                if(typeof logs == "undefined")
                    return;

                let newLogs = logs.map(log => {
                    return log;
                })
                newLogs.push(log);
                return newLogs;
            });
            scrollToBottom();
        })
    }, [socket]);

    const fetchLogs = async () => {
        if(typeof window == "undefined")
            return;

        try {
            const response = await fetch(`/api/log?gameId=${gameId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if(!response.ok){
                console.error(response.statusText);
                return;
            }

            const logsResult = await (response.json() as Promise<Log[]>);

            setLogs(logsResult);
            scrollToBottom();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Box mt={2} sx={{
            border: 1,
            borderRadius: 1,
            height: 200,
            p: 1,
            overflow: "auto"
        }}>
            {typeof logs != "undefined" 
                ? logs.map((log) => (
                    <Typography key={log.id}>[{dateTimeFormat.format(new Date(log.createdTime))}] {log.value}</Typography>
                    ))
                : <Typography>Loading...</Typography>
            }
            <div ref={messagesEndRef} />
        </Box>
    );
};

export default Logs;