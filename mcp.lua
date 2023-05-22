local mcp_proto = Proto("mcp-original", "My Transmission Protocol")

function mcp_proto.dissector(buffer, pinfo, tree)
  pinfo.cols.protocol = "mcp-original"
  local subtree = tree:add(mcp_proto, buffer(), "MCP Protocol Data")

  local message_type = buffer(0, 1)
  local message_type_msg = "Password"
  if message_type:uint() == 0 or message_type:uint() == 1 then
	  message_type_msg = "Data"
  end
  subtree:add(message_type, "Message type: " .. message_type_msg)

  if message_type_msg == "Data" then -- data
    local is_light_on = buffer(0, 1)
    local is_light_on_msg = "on"
    if message_type:uint() == 0 then
	  is_light_on_msg = "off"
    end

    subtree:add(is_light_on, "Is light on: " .. is_light_on_msg)

    local speed = buffer(1, 1)
    subtree:add(speed, "Speed: " .. speed:uint64())

    local rotation = buffer(2, 1)
    subtree:add(rotation, "Rotation: " .. rotation:int64())
  else
    local password = buffer(1, buffer:len() - 1)
    subtree:add(password, "Password: " .. password:string())

  end
end

-- load the tcp.port table
local tcp_table = DissectorTable.get("tcp.port")
-- register our protocol to handle tcp port 8080
tcp_table:add(8080, mcp_proto)
